const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

// Inscription
router.post('/register', async (req, res) => {
    try {
        const { nom, prenom, email, telephone, password } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Créer le nouvel utilisateur
        const user = new User({
            nom,
            prenom,
            email,
            telephone,
            password
        });

        await user.save();

        // Générer le token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                telephone: user.telephone,
                isAdmin: user.isAdmin
            },
            token
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Connexion
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Trouver l'utilisateur
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Générer le token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            user: {
                id: user._id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                telephone: user.telephone,
                isAdmin: user.isAdmin
            },
            token
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
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