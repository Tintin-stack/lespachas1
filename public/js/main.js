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
    }

    // Fonction pour revenir à la page d'accueil
    function showLandingPage() {
        sections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
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

    // Gestion des formulaires
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
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
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            const nom = this.querySelector('#registerNom').value;
            const prenom = this.querySelector('#registerPrenom').value;

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password, nom, prenom })
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
    }

    // Gestion du formulaire d'ajout d'événement
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
}); 