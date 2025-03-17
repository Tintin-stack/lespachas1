const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isPublished: {
        type: Boolean,
        default: false
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index pour la recherche d'événements
eventSchema.index({ title: 'text', description: 'text' });

// Méthode pour vérifier si un événement est complet
eventSchema.methods.isFull = function() {
    return this.participants.length >= this.capacity;
};

// Méthode pour vérifier si un utilisateur participe déjà
eventSchema.methods.isParticipating = function(userId) {
    return this.participants.includes(userId);
};

const Event = mongoose.model('Event', eventSchema);
module.exports = Event; 