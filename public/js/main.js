document.addEventListener('DOMContentLoaded', function() {
    // Gestion du modal de connexion
    const accountSection = document.querySelector('.account-section');
    const overlay = document.querySelector('.overlay');
    const authButton = document.getElementById('authButton');
    const closeAccount = document.querySelector('.close-account');
    const accountTabs = document.querySelectorAll('.account-tab');
    const authForms = document.querySelectorAll('.auth-form');

    // Ne pas afficher le modal au chargement
    accountSection.style.display = 'none';
    overlay.style.display = 'none';

    // Ouvrir le modal uniquement quand on clique sur le bouton compte
    authButton.addEventListener('click', function() {
        accountSection.style.display = 'block';
        overlay.style.display = 'block';
        accountSection.classList.add('fade-in');
    });

    // Fermer le modal
    closeAccount.addEventListener('click', function() {
        accountSection.classList.remove('fade-in');
        setTimeout(() => {
            accountSection.style.display = 'none';
            overlay.style.display = 'none';
        }, 300);
    });

    overlay.addEventListener('click', function() {
        accountSection.classList.remove('fade-in');
        setTimeout(() => {
            accountSection.style.display = 'none';
            overlay.style.display = 'none';
        }, 300);
    });

    // Gestion des onglets du modal
    accountTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            accountTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const targetForm = this.dataset.tab;
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${targetForm}Form`) {
                    form.classList.add('active');
                }
            });
        });
    });

    // Gestion de la navigation
    const navItems = document.querySelectorAll('.nav-item, .side-nav-item');
    const sections = document.querySelectorAll('.section');
    const landingPage = document.querySelector('.landing-page');
    const backButtons = document.querySelectorAll('.back-button');

    // Cacher toutes les sections au chargement
    sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });

    // Fonction pour afficher une section
    function showSection(sectionId) {
        landingPage.style.display = 'none';
        sections.forEach(section => {
            if (section.id === sectionId) {
                section.style.display = 'block';
                // Petit délai pour permettre l'animation
                setTimeout(() => {
                    section.classList.add('active');
                }, 50);
            } else {
                section.classList.remove('active');
                section.style.display = 'none';
            }
        });
    }

    // Gestion des clics sur les éléments de navigation
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.dataset.section;
            if (targetSection) {
                showSection(targetSection);
            }
        });
    });

    // Gestion des boutons retour
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            sections.forEach(section => {
                section.classList.remove('active');
                setTimeout(() => {
                    section.style.display = 'none';
                }, 300);
            });
            landingPage.style.display = 'flex';
            landingPage.classList.add('fade-in');
            setTimeout(() => {
                landingPage.classList.remove('fade-in');
            }, 500);
        });
    });

    // Gestion de la musique
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    let isMusicPlaying = false;

    musicToggle.addEventListener('click', function() {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
        } else {
            bgMusic.play();
            musicToggle.classList.add('playing');
        }
        isMusicPlaying = !isMusicPlaying;
    });

    // Gestion des formulaires
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const eventForm = document.getElementById('eventForm');
    const adminSection = document.querySelector('.admin-section');

    // Vérifier si l'utilisateur est admin
    function checkAdminStatus() {
        const token = localStorage.getItem('token');
        if (token) {
            fetch('/api/auth/check-admin', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.isAdmin) {
                    // Créer et afficher la bannière admin
                    const adminBanner = document.createElement('div');
                    adminBanner.className = 'admin-banner';
                    adminBanner.innerHTML = `
                        <i class="fas fa-crown"></i>
                        Vous êtes administrateur - Vous pouvez gérer les événements et les utilisateurs
                    `;
                    document.body.appendChild(adminBanner);
                    setTimeout(() => adminBanner.classList.add('visible'), 100);

                    // Afficher la section admin
                    if (adminSection) {
                        adminSection.style.display = 'block';
                    }

                    // Ajouter le lien vers la section admin dans la navigation
                    const adminLink = document.createElement('div');
                    adminLink.className = 'nav-item';
                    adminLink.dataset.section = 'add-event';
                    adminLink.innerHTML = '<i class="fas fa-plus-circle"></i> Ajouter un événement';
                    document.querySelector('.nav-links').appendChild(adminLink);
                }
            })
            .catch(error => console.error('Erreur:', error));
        }
    }

    // Appeler la vérification au chargement
    checkAdminStatus();

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        const password = this.querySelector('input[type="password"]').value;

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                window.location.reload();
            } else {
                alert(data.message || 'Erreur de connexion');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur de connexion');
        }
    });

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        const password = this.querySelector('input[type="password"]').value;
        const name = this.querySelector('input[type="text"]').value;

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, name })
            });

            const data = await response.json();
            if (response.ok) {
                alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
                document.querySelector('[data-tab="login"]').click();
            } else {
                alert(data.message || 'Erreur d\'inscription');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur d\'inscription');
        }
    });

    // Gestion du formulaire d'ajout d'événement
    eventForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vous devez être connecté pour ajouter un événement');
            return;
        }

        const formData = new FormData();
        formData.append('title', document.getElementById('eventTitle').value);
        formData.append('date', document.getElementById('eventDate').value);
        formData.append('location', document.getElementById('eventLocation').value);
        formData.append('description', document.getElementById('eventDescription').value);
        
        const imageFile = document.getElementById('eventImage').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                alert('Événement ajouté avec succès !');
                eventForm.reset();
                // Envoyer les emails aux membres
                sendEventEmails(data.event);
            } else {
                alert(data.message || 'Erreur lors de l\'ajout de l\'événement');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de l\'ajout de l\'événement');
        }
    });

    // Fonction pour envoyer les emails aux membres
    async function sendEventEmails(event) {
        try {
            const response = await fetch('/api/events/send-emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ eventId: event._id })
            });

            if (!response.ok) {
                console.error('Erreur lors de l\'envoi des emails');
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    }
}); 