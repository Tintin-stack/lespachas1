const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../config/email');

// Middleware pour vérifier le token
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id });

        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Veuillez vous authentifier.' });
    }
};

// Inscription
router.post('/register', async (req, res) => {
    try {
        const { nom, prenom, email, password, telephone } = req.body;

        // Vérifier si l'email existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        // Vérifier si l'email est dans la liste des administrateurs
        const adminEmails = process.env.ADMIN_EMAILS.split(',');
        const isAdmin = adminEmails.includes(email);

        // Créer le nouvel utilisateur
        const user = new User({
            nom,
            prenom,
            email,
            password,
            telephone,
            role: isAdmin ? 'admin' : 'user'
        });
        await user.save();

        // Générer le token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        // Envoyer un email de confirmation
        const subject = 'Bienvenue sur Les Pachas !';
        const html = `
            <h2>Bienvenue ${prenom} ${nom} !</h2>
            <p>Votre compte a été créé avec succès.</p>
            ${isAdmin ? '<p><strong>Vous êtes administrateur du site.</strong></p>' : ''}
            <p>Vous pouvez maintenant vous connecter et accéder à toutes les fonctionnalités du site.</p>
        `;
        await sendEmail(email, subject, html);

        res.status(201).json({ user, token });
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
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        // Vérifier le mot de passe
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
        }

        // Générer le token
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.json({ user, token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Vérifier le statut admin
router.get('/check-admin', auth, async (req, res) => {
    try {
        res.json({ isAdmin: req.user.isAdmin() });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Déconnexion
router.post('/logout', auth, async (req, res) => {
    try {
        // Le token est géré côté client
        res.json({ message: 'Déconnexion réussie.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 