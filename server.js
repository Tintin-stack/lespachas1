require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Configuration Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Les variables d\'environnement Supabase ne sont pas définies');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Routes d'authentification
app.post('/api/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Tentative d\'inscription pour:', email);
        
        // Vérifier si l'utilisateur existe déjà
        console.log('Vérification de l\'existence de l\'utilisateur...');
        const { data: existingUser, error: searchError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (searchError) {
            console.error('Erreur lors de la recherche de l\'utilisateur:', searchError);
            return res.status(500).json({ error: 'Erreur lors de la vérification de l\'email' });
        }

        if (existingUser) {
            console.log('Email déjà utilisé:', email);
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }

        console.log('Hachage du mot de passe...');
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Créer l'utilisateur
        console.log('Création de l\'utilisateur...');
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([
                {
                    email,
                    password: hashedPassword,
                    is_admin: email.includes('admin')
                }
            ])
            .select()
            .single();

        if (insertError) {
            console.error('Erreur lors de l\'insertion de l\'utilisateur:', insertError);
            throw insertError;
        }
        
        console.log('Utilisateur créé avec succès:', email);
        res.status(201).json({ message: 'Utilisateur créé avec succès' });
    } catch (error) {
        console.error('Erreur détaillée lors de l\'inscription:', error);
        res.status(500).json({ error: 'Erreur lors de l\'inscription' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Rechercher l'utilisateur
        const { data: user, error: searchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (!user) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
        }
        
        const token = jwt.sign(
            { userId: user.id, isAdmin: user.is_admin },
            process.env.JWT_SECRET || 'votre_secret_jwt',
            { expiresIn: '24h' }
        );
        
        res.json({ token, isAdmin: user.is_admin });
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ error: 'Erreur lors de la connexion' });
    }
});

// Route pour servir l'application
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);
    res.status(500).json({ error: 'Une erreur est survenue sur le serveur' });
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
}); 