const nodemailer = require('nodemailer');

// Configuration du transporteur d'emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Fonction pour envoyer un email
const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'email:', error);
        return false;
    }
};

// Fonction pour envoyer un email d'événement
const sendEventEmail = async (user, event) => {
    const subject = `Nouvel événement : ${event.title}`;
    const html = `
        <h2>${event.title}</h2>
        <p>Bonjour ${user.name},</p>
        <p>Un nouvel événement a été ajouté :</p>
        <ul>
            <li><strong>Date :</strong> ${new Date(event.date).toLocaleString()}</li>
            <li><strong>Lieu :</strong> ${event.location}</li>
            <li><strong>Description :</strong> ${event.description}</li>
        </ul>
        <p>Pour plus d'informations, visitez notre site web.</p>
    `;

    return sendEmail(user.email, subject, html);
};

// Fonction pour envoyer des emails à tous les membres
const sendEventEmailsToMembers = async (members, event) => {
    const results = await Promise.all(
        members.map(member => sendEventEmail(member, event))
    );
    return results.every(result => result);
};

module.exports = {
    sendEmail,
    sendEventEmail,
    sendEventEmailsToMembers
}; 