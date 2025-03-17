const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Event = require('../models/Event');
const User = require('../models/User');
const { sendEventEmailsToMembers } = require('../config/email');

// Configuration de multer pour le stockage des images
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/events');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB max
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers images sont autorisés !'));
        }
    }
});

// Middleware pour vérifier le token et le rôle admin
const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id });

        if (!user || !user.isAdmin()) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Accès non autorisé.' });
    }
};

// Créer un événement
router.post('/', adminAuth, upload.single('image'), async (req, res) => {
    try {
        const { title, date, location, description } = req.body;
        const image = req.file ? `/uploads/events/${req.file.filename}` : null;

        const event = new Event({
            title,
            date,
            location,
            description,
            image,
            createdBy: req.user._id
        });

        await event.save();

        // Récupérer tous les utilisateurs pour l'envoi d'emails
        const users = await User.find({});
        await sendEventEmailsToMembers(users, event);

        res.status(201).json({ event });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Récupérer tous les événements
router.get('/', async (req, res) => {
    try {
        const events = await Event.find()
            .sort({ date: 1 })
            .populate('createdBy', 'name');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Récupérer un événement spécifique
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'name');
        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé.' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mettre à jour un événement
router.patch('/:id', adminAuth, upload.single('image'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé.' });
        }

        const updates = Object.keys(req.body);
        updates.forEach(update => event[update] = req.body[update]);

        if (req.file) {
            event.image = `/uploads/events/${req.file.filename}`;
        }

        await event.save();
        res.json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Supprimer un événement
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé.' });
        }
        res.json({ message: 'Événement supprimé avec succès.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 