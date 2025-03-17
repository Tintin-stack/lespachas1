const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // limite à 5MB
    },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Seules les images sont autorisées'));
    }
});

// Route pour uploader une photo
router.post('/upload', auth, upload.single('photo'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier uploadé' });
        }
        res.json({
            message: 'Photo uploadée avec succès',
            filename: req.file.filename,
            path: `/uploads/${req.file.filename}`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Route pour récupérer une photo
router.get('/:filename', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/uploads/', req.params.filename));
});

// GET toutes les photos
router.get('/', async (req, res) => {
    try {
        res.json({ message: "Route des photos fonctionnelle" });
    } catch (error) {
        res.status(500).send('Erreur serveur');
    }
});

module.exports = router; 