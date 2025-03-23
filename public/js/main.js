document.addEventListener('DOMContentLoaded', function() {
    // Sélection des éléments
    const sections = document.querySelectorAll('.section');
    const landingPage = document.querySelector('.landing-page');
    const accountModal = document.querySelector('.account-modal');
    const modalOverlay = document.querySelector('.modal-overlay');
    const modalClose = document.querySelector('.modal-close');
    const authButton = document.getElementById('authButton');
    const accountTabs = document.querySelectorAll('.account-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const switchToLogin = document.querySelector('.switch-to-login');
    const switchToRegister = document.querySelector('.switch-to-register');
    const backButtons = document.querySelectorAll('.back-button');

    // Initialisation : cacher toutes les sections sauf la landing page
    sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active');
    });
    landingPage.style.display = 'flex';

    // Fonction pour afficher le modal
    function showAccountModal() {
        modalOverlay.style.display = 'block';
        accountModal.style.display = 'block';
        setTimeout(() => {
            modalOverlay.classList.add('active');
            accountModal.classList.add('active');
        }, 10);
    }

    // Fonction pour cacher le modal
    function hideAccountModal() {
        modalOverlay.classList.remove('active');
        accountModal.classList.remove('active');
        setTimeout(() => {
            modalOverlay.style.display = 'none';
            accountModal.style.display = 'none';
        }, 300);
    }

    // Événements du modal
    if (authButton) {
        authButton.addEventListener('click', showAccountModal);
    }
    if (modalClose) {
        modalClose.addEventListener('click', hideAccountModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', hideAccountModal);
    }

    // Fonction pour afficher une section
    function showSection(sectionId) {
        const curtainContainer = document.querySelector('.curtain-container');
        
        // Fermer les rideaux
        curtainContainer.classList.remove('curtain-open');
        
        setTimeout(() => {
            // Cacher la landing page
            landingPage.style.display = 'none';

            // Cacher toutes les sections
            sections.forEach(section => {
                section.style.display = 'none';
                section.classList.remove('active');
            });

            // Afficher la section demandée
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.style.display = 'block';
                setTimeout(() => {
                    targetSection.classList.add('active');
                }, 10);
            }

            // Cacher le modal de compte
            hideAccountModal();

            // Ouvrir les rideaux après le changement de section
            setTimeout(() => {
                curtainContainer.classList.add('curtain-open');
            }, 500);
        }, 1000);
    }

    // Fonction pour revenir à la page d'accueil
    function showLandingPage() {
        const curtainContainer = document.querySelector('.curtain-container');
        
        // Fermer les rideaux
        curtainContainer.classList.remove('curtain-open');
        
        setTimeout(() => {
            sections.forEach(section => {
                section.style.display = 'none';
                section.classList.remove('active');
            });
            landingPage.style.display = 'flex';

            // Ouvrir les rideaux après le retour à l'accueil
            setTimeout(() => {
                curtainContainer.classList.add('curtain-open');
            }, 500);
        }, 1000);
    }

    // Gestion des clics sur les éléments de navigation
    document.querySelectorAll('.nav-item, .sidebar-item').forEach(item => {
        item.addEventListener('click', function(e) {
            const sectionId = this.getAttribute('data-section');
            if (sectionId) {
                e.preventDefault();
                showSection(sectionId);
            }
        });
    });

    // Gestion du bouton retour
    backButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            showLandingPage();
        });
    });

    // Gestion des onglets du modal
    accountTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            
            // Mise à jour des onglets
            accountTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Mise à jour des formulaires
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${targetTab}Form`) {
                    form.classList.add('active');
                }
            });
        });
    });

    // Gestion des liens de changement de formulaire
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('[data-tab="login"]').click();
        });
    }
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('[data-tab="register"]').click();
        });
    }

    // Gestion de la musique
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    let isMusicPlaying = false;

    if (musicToggle && bgMusic) {
        musicToggle.addEventListener('click', () => {
            if (isMusicPlaying) {
                bgMusic.pause();
                musicToggle.innerHTML = '<i class="fas fa-music"></i>';
            } else {
                bgMusic.play().catch(error => {
                    console.log('Lecture automatique non autorisée');
                });
                musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
            }
            isMusicPlaying = !isMusicPlaying;
        });
    }

    // Gestion des formulaires de connexion et d'inscription
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');

    // Liste des emails admin autorisés
    const ADMIN_EMAILS = ['admin@lespachas.fr', 'lespachas.admin@gmail.com'];

    // Gestion des onglets
    loginTab.addEventListener('click', () => {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    });

    registerTab.addEventListener('click', () => {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.style.display = 'block';
        loginForm.style.display = 'none';
    });

    // Gestion de la connexion
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('isAdmin', data.isAdmin);
                localStorage.setItem('userEmail', email);
                localStorage.setItem('token', data.token);
                hideAccountModal();
                checkAdminStatus();
                alert('Connexion réussie !');
            } else {
                alert(data.error || 'Email ou mot de passe incorrect');
            }
        } catch (error) {
            console.error('Erreur de connexion:', error);
            alert('Erreur de connexion. Veuillez réessayer.');
        }
    });

    // Gestion de l'inscription
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (password !== confirmPassword) {
            alert('Les mots de passe ne correspondent pas.');
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
                document.querySelector('[data-tab="login"]').click();
            } else {
                alert(data.error || 'Erreur lors de l\'inscription');
            }
        } catch (error) {
            console.error('Erreur d\'inscription:', error);
            alert('Erreur lors de l\'inscription. Veuillez réessayer.');
        }
    });

    // Fonction pour vérifier le statut admin
    function checkAdminStatus() {
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        if (isAdmin) {
            // Créer et afficher la bannière admin
            const adminBanner = document.createElement('div');
            adminBanner.className = 'admin-banner';
            adminBanner.innerHTML = `
                <i class="fas fa-crown"></i>
                Vous êtes administrateur - Vous pouvez gérer les événements
            `;
            document.body.appendChild(adminBanner);
            setTimeout(() => adminBanner.classList.add('visible'), 100);

            // Afficher la section admin
            const adminSection = document.querySelector('.admin-section');
            if (adminSection) {
                adminSection.style.display = 'block';
            }

            // Ajouter le lien vers la section admin dans la navigation
            const navLinks = document.querySelector('.nav-links');
            if (navLinks && !document.querySelector('[data-section="add-event"]')) {
                const adminLink = document.createElement('div');
                adminLink.className = 'sidebar-item';
                adminLink.dataset.section = 'add-event';
                adminLink.innerHTML = '<i class="fas fa-plus-circle"></i><span>Ajouter un événement</span>';
                navLinks.appendChild(adminLink);
                
                // Ajouter l'écouteur d'événements pour la navigation
                adminLink.addEventListener('click', function() {
                    showSection('add-event');
                });
            }
        }
    }

    // Configuration EmailJS
    const EMAIL_CONFIG = {
        serviceID: 'service_d5avvat',
        templateID: 'template_p2vdpno',
        userID: 'bSPMC73_nkit6xKfU'
    };

    // Fonction pour envoyer des notifications
    async function sendNotification(type, data) {
        const templates = {
            'event': {
                template: EMAIL_CONFIG.templateID,
                params: {
                    event_title: data.title,
                    event_date: new Date(data.date).toLocaleDateString('fr-FR'),
                    event_time: new Date(data.date).toLocaleTimeString('fr-FR'),
                    event_location: data.location,
                    event_description: data.description
                }
            }
        };

        const template = templates[type];
        if (!template) return;

        try {
            const response = await emailjs.send(
                EMAIL_CONFIG.serviceID,
                template.template,
                template.params,
                EMAIL_CONFIG.userID
            );
            console.log('Notification envoyée avec succès:', response);
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la notification:', error);
            return false;
        }
    }

    // Gestion du formulaire d'ajout d'événement
    const eventForm = document.getElementById('eventForm');
    if (eventForm) {
        eventForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const eventData = {
                title: document.getElementById('eventTitle').value,
                date: document.getElementById('eventDate').value,
                location: document.getElementById('eventLocation').value,
                description: document.getElementById('eventDescription').value
            };

            try {
                // Envoyer l'événement au serveur
                const response = await fetch('/api/events', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(eventData)
                });

                if (response.ok) {
                    // Envoyer la notification
                    const notificationSent = await sendNotification('event', eventData);
                    
                    if (notificationSent) {
                        alert('Événement créé et notifications envoyées avec succès !');
                    } else {
                        alert('Événement créé mais erreur lors de l\'envoi des notifications.');
                    }
                    
                    loadEvents(); // Recharger la liste des événements
                    this.reset(); // Réinitialiser le formulaire
                } else {
                    alert('Erreur lors de la création de l\'événement');
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de la création de l\'événement');
            }
        });
    }

    // Chargement des événements
    function loadEvents() {
        fetch('/api/events')
            .then(response => response.json())
            .then(events => {
                const eventsGrid = document.querySelector('.events-grid');
                if (eventsGrid) {
                    eventsGrid.innerHTML = events.map(event => `
                        <div class="event-card">
                            <div class="event-date">${new Date(event.date).toLocaleDateString()}</div>
                            <h3 class="event-title">${event.title}</h3>
                            <p class="event-description">${event.description}</p>
                            <p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>
                        </div>
                    `).join('');
                }
            })
            .catch(error => console.error('Erreur lors du chargement des événements:', error));
    }

    // Charger les événements au chargement de la page
    loadEvents();

    // Vérification initiale du statut admin
    checkAdminStatus();
    
    // Ouvrir les rideaux au chargement initial
    document.addEventListener('DOMContentLoaded', () => {
        const curtainContainer = document.querySelector('.curtain-container');
        setTimeout(() => {
            curtainContainer.classList.add('curtain-open');
        }, 500);
    });
}); 