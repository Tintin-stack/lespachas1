const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// Obtenir tous les événements
router.get('/', async (req, res) => {
    try {
        const events = await Event.find()
            .sort({ date: 1 })
            .populate('organizer', 'nom prenom email')
            .populate('participants', 'nom prenom email');
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des événements' });
    }
});

// Créer un nouvel événement
router.post('/', auth, async (req, res) => {
    try {
        const event = new Event({
            ...req.body,
            organizer: req.user._id
        });

        await event.save();

        // Envoyer un email de confirmation à l'organisateur
        await sendEmail({
            to: req.user.email,
            subject: 'Confirmation de création d\'événement',
            text: `Votre événement "${event.title}" a été créé avec succès. Il aura lieu le ${new Date(event.date).toLocaleString()} à ${event.location}.`
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Obtenir un événement spécifique
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('organizer', 'nom prenom email')
            .populate('participants', 'nom prenom email');
            
        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }
        
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'événement' });
    }
});

// Participer à un événement
router.put('/:id/participate', auth, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        
        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        // Vérifier si l'utilisateur participe déjà
        if (event.isParticipating(req.user._id)) {
            return res.status(400).json({ message: 'Vous participez déjà à cet événement' });
        }

        // Vérifier si l'événement est complet
        if (event.isFull()) {
            return res.status(400).json({ message: 'L\'événement est complet' });
        }

        // Ajouter l'utilisateur aux participants
        event.participants.push(req.user._id);
        await event.save();

        // Envoyer un email de confirmation
        await sendEmail({
            to: req.user.email,
            subject: 'Confirmation d\'inscription à l\'événement',
            text: `Vous êtes inscrit à l'événement "${event.title}" qui aura lieu le ${new Date(event.date).toLocaleString()} à ${event.location}.`
        });

        res.json({ message: 'Inscription réussie' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'inscription à l\'événement' });
    }
});

module.exports = router; 