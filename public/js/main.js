document.addEventListener('DOMContentLoaded', function() {
    // Configuration EmailJS
    const EMAIL_CONFIG = {
        serviceID: 'service_d5avvat',
        templateID: 'template_hv30nek',
        userID: 'bSPMC73_nkit6xKfU'
    };

    // Liste des emails admin autorisés
    const ADMIN_EMAILS = ['admin@lespachas.fr', 'lespachas.admin@gmail.com'];

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
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');

    // Initialisation : afficher la landing page immédiatement
    sections.forEach(section => {
        section.style.display = 'none';
    });
    landingPage.style.display = 'flex';

    // Fonction pour afficher le modal
    function showAccountModal() {
        modalOverlay.classList.add('active');
        accountModal.classList.add('active');
        // Afficher le formulaire de connexion par défaut
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    }

    // Fonction pour cacher le modal
    function hideAccountModal() {
        modalOverlay.classList.remove('active');
        accountModal.classList.remove('active');
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
        hideAccountModal();
    }

    // Fonction pour revenir à la page d'accueil
    function showLandingPage() {
        sections.forEach(section => {
            section.classList.remove('active');
            setTimeout(() => {
                section.style.display = 'none';
            }, 500);
        });
        landingPage.style.display = 'flex';
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
            accountTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (targetTab === 'login') {
                loginForm.classList.add('active');
                registerForm.classList.remove('active');
            } else {
                registerForm.classList.add('active');
                loginForm.classList.remove('active');
            }
        });
    });

    // Initialiser l'affichage du formulaire actif
    const activeTab = document.querySelector('.account-tab.active');
    if (activeTab) {
        activeTab.click();
    }

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

    // Gestion de la musique de fond
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');

    // Fonction simple pour basculer la musique
    function toggleMusic() {
        if (bgMusic.paused) {
            bgMusic.volume = 0.3;
            bgMusic.play();
            musicToggle.classList.add('playing');
        } else {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
        }
    }

    // Initialiser la musique
    if (bgMusic && musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
        bgMusic.addEventListener('canplaythrough', () => {
            console.log('Musique prête à être jouée');
        });
    }

    // Fonction pour vérifier si un email est admin
    function isAdminEmail(email) {
        return ADMIN_EMAILS.includes(email);
    }

    // Fonction pour vérifier le statut admin
    function checkAdminStatus() {
        const userEmail = localStorage.getItem('userEmail');
        console.log('Checking admin status for:', userEmail); // Debug log
        
        // Vérifier si l'email est dans la liste des admins
        const hasAdminRights = isAdminEmail(userEmail);
        console.log('Has admin rights:', hasAdminRights); // Debug log
        
        // Mettre à jour le statut admin dans le localStorage
        localStorage.setItem('isAdmin', hasAdminRights);
        
        // Afficher ou masquer les éléments admin
        const adminElements = document.querySelectorAll('.admin-section');
        adminElements.forEach(element => {
            if (hasAdminRights) {
                element.classList.add('visible');
                element.style.display = 'block';
            } else {
                element.classList.remove('visible');
                element.style.display = 'none';
            }
        });

        // Afficher ou masquer la bannière admin
        let adminBanner = document.querySelector('.admin-banner');
        if (hasAdminRights) {
            if (!adminBanner) {
                adminBanner = document.createElement('div');
                adminBanner.className = 'admin-banner';
                adminBanner.innerHTML = `
                    <i class="fas fa-crown"></i>
                    Mode Administrateur
                `;
                document.body.appendChild(adminBanner);
            }
            adminBanner.classList.add('visible');
            adminBanner.style.display = 'block';
        } else {
            if (adminBanner) {
                adminBanner.classList.remove('visible');
                adminBanner.style.display = 'none';
            }
        }

        // Afficher ou masquer le bouton d'ajout d'événement
        const addEventBtns = document.querySelectorAll('.add-event-btn');
        addEventBtns.forEach(btn => {
            if (hasAdminRights) {
                btn.classList.add('visible');
                btn.style.display = 'flex';
            } else {
                btn.classList.remove('visible');
                btn.style.display = 'none';
            }
        });
    }

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
                localStorage.setItem('userEmail', email);
                localStorage.setItem('token', data.token);
                hideAccountModal();
                checkAdminStatus(); // Vérifier le statut admin après la connexion
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
                // Envoyer un email de confirmation
                try {
                    console.log('Tentative d\'envoi de l\'email de bienvenue à:', email);
                    const emailResult = await emailjs.send(
                        EMAIL_CONFIG.serviceID,
                        EMAIL_CONFIG.templateID,
                        {
                            to_name: email.split('@')[0],
                            to_email: email,
                            message: "Bienvenue dans la pachas family, tu seras maintenant au courant de nos prochains events !!"
                        },
                        EMAIL_CONFIG.userID
                    );
                    console.log('Email de bienvenue envoyé avec succès:', emailResult);
                } catch (emailError) {
                    console.error('Erreur lors de l\'envoi de l\'email:', emailError);
                    alert('Votre compte a été créé mais l\'email de bienvenue n\'a pas pu être envoyé.');
                }
                
                // Stocker l'email et vérifier le statut admin
                localStorage.setItem('userEmail', email);
                checkAdminStatus();
                
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

    // Fonction pour envoyer un email de notification d'événement
    async function sendEventNotification(event) {
        try {
            console.log('Début de l\'envoi des notifications pour l\'événement:', event.title);
            // Récupérer tous les utilisateurs enregistrés
            const response = await fetch('/api/users');
            const users = await response.json();
            console.log('Nombre d\'utilisateurs à notifier:', users.length);
            
            // Envoyer un email à chaque utilisateur
            for (const user of users) {
                try {
                    console.log('Envoi de la notification à:', user.email);
                    const emailResult = await emailjs.send(
                        EMAIL_CONFIG.serviceID,
                        EMAIL_CONFIG.templateID,
                        {
                            to_name: user.email.split('@')[0],
                            to_email: user.email,
                            message: `Nouvel événement : ${event.title}\nDate : ${new Date(event.date).toLocaleDateString('fr-FR')}\nLieu : ${event.location}\nDescription : ${event.description}`
                        },
                        EMAIL_CONFIG.userID
                    );
                    console.log('Notification envoyée avec succès à:', user.email, emailResult);
                } catch (userError) {
                    console.error('Erreur lors de l\'envoi à', user.email, ':', userError);
                }
            }
            console.log('Fin de l\'envoi des notifications pour l\'événement:', event.title);
        } catch (error) {
            console.error('Erreur lors de l\'envoi des notifications:', error);
            alert('L\'événement a été ajouté mais les notifications n\'ont pas pu être envoyées.');
        }
    }

    // Gestion de l'ajout d'événement
    document.querySelector('.add-event-btn').addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Vérifier les droits d'administration
        const userEmail = localStorage.getItem('userEmail');
        if (!isAdminEmail(userEmail)) {
            alert('Vous n\'avez pas les droits d\'administration pour ajouter un événement.');
            return;
        }

        const eventForm = document.createElement('form');
        eventForm.className = 'event-form';
        eventForm.innerHTML = `
            <div class="form-group">
                <label for="event-title">Titre de l'événement</label>
                <input type="text" id="event-title" required>
            </div>
            <div class="form-group">
                <label for="event-date">Date et heure</label>
                <input type="datetime-local" id="event-date" required>
            </div>
            <div class="form-group">
                <label for="event-location">Lieu</label>
                <input type="text" id="event-location" required>
            </div>
            <div class="form-group">
                <label for="event-description">Description</label>
                <textarea id="event-description" required></textarea>
            </div>
            <button type="submit" class="submit-btn">Ajouter l'événement</button>
        `;

        const container = document.querySelector('.event-form-container');
        container.innerHTML = '';
        container.appendChild(eventForm);

        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const event = {
                title: document.getElementById('event-title').value,
                date: document.getElementById('event-date').value,
                location: document.getElementById('event-location').value,
                description: document.getElementById('event-description').value
            };

            try {
                const response = await fetch('/api/events', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(event)
                });

                if (response.ok) {
                    // Envoyer les notifications par email
                    await sendEventNotification(event);
                    
                    alert('Événement ajouté avec succès !');
                    loadEvents(); // Recharger la liste des événements
                    eventForm.reset();
                } else {
                    alert('Erreur lors de l\'ajout de l\'événement');
                }
            } catch (error) {
                console.error('Erreur:', error);
                alert('Erreur lors de l\'ajout de l\'événement');
            }
        });
    });

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

    // Vérifier le statut admin au chargement de la page
    checkAdminStatus();

    // Gestion du menu hamburger
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });

        // Fermer le menu lors du clic sur un lien
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                sidebar.classList.remove('active');
            });
        });

        // Fermer le menu lors du clic en dehors
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('active');
            }
        });
    }
}); 