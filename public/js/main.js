document.addEventListener('DOMContentLoaded', function() {
    // Gestion du modal de connexion
    const accountModal = document.querySelector('.account-modal');
    const modalClose = document.querySelector('.modal-close');
    const authButton = document.getElementById('authButton');
    const accountTabs = document.querySelectorAll('.account-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const switchToLogin = document.querySelector('.switch-to-login');
    const switchToRegister = document.querySelector('.switch-to-register');

    // Fonction pour afficher le modal
    function showAccountModal() {
        accountModal.style.display = 'block';
        setTimeout(() => {
            accountModal.classList.add('active');
        }, 10);
    }

    // Fonction pour cacher le modal
    function hideAccountModal() {
        accountModal.classList.remove('active');
        setTimeout(() => {
            accountModal.style.display = 'none';
        }, 300);
    }

    // Événements pour le modal
    authButton.addEventListener('click', showAccountModal);
    modalClose.addEventListener('click', hideAccountModal);

    // Gestion des onglets
    accountTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Mise à jour des onglets actifs
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

    // Gestion du changement de formulaire
    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('[data-tab="login"]').click();
    });

    switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('[data-tab="register"]').click();
    });

    // Gestion de la navigation
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-item, .sidebar-item');
    const backButtons = document.querySelectorAll('.back-button');
    const landingPage = document.querySelector('.landing-page');

    // Fonction pour afficher une section
    function showSection(sectionId) {
        // Cacher toutes les sections
        sections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        // Cacher la page d'accueil
        landingPage.style.display = 'none';

        // Afficher la section demandée
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            setTimeout(() => {
                targetSection.classList.add('active');
            }, 10);
        }

        // Cacher le modal de compte si ouvert
        hideAccountModal();
    }

    // Fonction pour afficher la page d'accueil
    function showLandingPage() {
        // Cacher toutes les sections
        sections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        // Afficher la page d'accueil
        landingPage.style.display = 'flex';
    }

    // Événements de navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.dataset.section;
            if (sectionId) {
                showSection(sectionId);
            }
        });
    });

    backButtons.forEach(button => {
        button.addEventListener('click', showLandingPage);
    });

    // Gestion de la musique
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    let isMusicPlaying = false;

    musicToggle.addEventListener('click', () => {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicToggle.innerHTML = '<i class="fas fa-music"></i>';
        } else {
            bgMusic.play();
            musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
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