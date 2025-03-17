const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// Middleware d'authentification
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            throw new Error();
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Veuillez vous authentifier' });
    }
};

// Route d'inscription
router.post('/register', async (req, res) => {
    try {
        const { nom, prenom, email, telephone, password } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Créer l'utilisateur
        const user = await User.create({
            nom,
            prenom,
            email,
            telephone,
            password
        });

        // Envoyer un email de confirmation
        await sendEmail(
            email,
            'Bienvenue sur Les Pachas !',
            `<h1>Bienvenue ${prenom} !</h1>
            <p>Votre compte a été créé avec succès sur Les Pachas.</p>
            <p>Vous pouvez maintenant vous connecter et accéder à toutes les fonctionnalités.</p>`
        );

        // Générer le token JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        res.status(201).json({
            _id: user._id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        console.error('Erreur d\'inscription:', error);
        res.status(500).json({ message: 'Erreur lors de l\'inscription' });
    }
});

// Route de connexion
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Générer le token JWT
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        res.json({
            _id: user._id,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        console.error('Erreur de connexion:', error);
        res.status(500).json({ message: 'Erreur lors de la connexion' });
    }
});

// Obtenir le profil utilisateur
router.get('/profile', auth, async (req, res) => {
    res.json(req.user);
});

// Mettre à jour les préférences de notification
router.patch('/notifications', auth, async (req, res) => {
    try {
        const user = req.user;
        user.notificationsEnabled = req.body.enabled;
        await user.save();
        res.json({ message: 'Préférences mises à jour' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router; 