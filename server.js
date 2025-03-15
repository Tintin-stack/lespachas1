require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const multer = require('multer');

// Configuration Twilio
const twilioClient = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Connexion à la base de données
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration de Multer pour l'upload de photos
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Routes API
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/photos', require('./routes/photoRoutes'));

// Route pour l'envoi de SMS
app.post('/api/notifications/sms', async (req, res) => {
    try {
        const { phoneNumber, message } = req.body;
        
        // Vérifier que le numéro commence par +33 ou 0
        const formattedNumber = phoneNumber.startsWith('0') 
            ? '+33' + phoneNumber.slice(1) 
            : phoneNumber;

        const smsResponse = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedNumber
        });

        res.json({ success: true, messageId: smsResponse.sid });
    } catch (error) {
        console.error('Erreur SMS:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Erreur lors de l\'envoi du SMS' 
        });
    }
});

// Servir les fichiers statiques en production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 