# Les Pachas - Site Web BDE ESPOL

Site web officiel du Bureau des Étudiants Les Pachas pour l'ESPOL 2025-2026.

## Fonctionnalités

- Inscription et connexion des utilisateurs
- Gestion des événements
- Système de notifications
- Interface responsive (mobile et desktop)

## Installation

1. Cloner le repository :
```bash
git clone https://github.com/votre-username/lespachas.git
cd lespachas
```

2. Installer les dépendances :
```bash
npm install
```

3. Créer un fichier `.env` à la racine du projet avec les variables suivantes :
```
PORT=4000
MONGO_URI=votre_uri_mongodb
EMAIL_USER=votre_email
EMAIL_PASSWORD=votre_mot_de_passe
JWT_SECRET=votre_secret_jwt
```

4. Lancer le serveur :
```bash
npm run dev
```

## Technologies utilisées

- Node.js
- Express.js
- MongoDB
- Bootstrap 5
- Font Awesome

## Structure du projet

```
lespachas/
├── public/           # Fichiers statiques
├── routes/          # Routes de l'API
├── models/          # Modèles MongoDB
├── utils/           # Utilitaires
├── middleware/      # Middleware Express
└── config/          # Configuration
```

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails. 