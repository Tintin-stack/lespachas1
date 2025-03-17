document.addEventListener('DOMContentLoaded', () => {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const sideNavItems = document.querySelectorAll('.side-nav-item');
    const sections = document.querySelectorAll('.section');
    const landingPage = document.querySelector('.landing-page');
    const backButtons = document.querySelectorAll('.back-button');
    const sideNav = document.querySelector('.side-nav');

    // État actuel
    let currentSection = null;
    let isAnimating = false;
    let events = [];
    let currentUser = null;
    let users = JSON.parse(localStorage.getItem('users') || '[]');

    // Configuration des notifications
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": true,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": false,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };

    // Gestion de l'authentification
    const accountSection = document.querySelector('.account-section');
    const overlay = document.querySelector('.overlay');
    const accountButton = document.getElementById('authButton');
    const closeAccountButton = document.querySelector('.close-account');
    const authTabs = document.querySelectorAll('.account-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Gestion de la musique de fond
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    let isMusicPlaying = false;

    musicToggle.addEventListener('click', () => {
        if (isMusicPlaying) {
            bgMusic.pause();
            musicToggle.classList.remove('playing');
        } else {
            bgMusic.play();
            musicToggle.classList.add('playing');
        }
        isMusicPlaying = !isMusicPlaying;
    });

    // Autoplay de la musique désactivé par défaut pour respecter les préférences utilisateur
    document.addEventListener('click', () => {
        if (!isMusicPlaying && bgMusic.paused) {
            bgMusic.volume = 0.3; // Volume modéré par défaut
        }
    }, { once: true });

    // Fonction pour ouvrir la modale du compte
    function openAccountModal() {
        accountSection.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    // Fonction pour fermer la modale du compte
    function closeAccountModal() {
        accountSection.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Gestionnaire de clic pour le bouton compte
    if (accountButton) {
        accountButton.addEventListener('click', (e) => {
            e.preventDefault();
            openAccountModal();
        });
    }

    // Gestionnaire de clic pour le bouton fermer
    if (closeAccountButton) {
        closeAccountButton.addEventListener('click', () => {
            closeAccountModal();
        });
    }

    // Fermer la modale en cliquant sur l'overlay
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeAccountModal();
            }
        });
    }

    // Gestion des onglets
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            authTabs.forEach(t => t.classList.remove('active'));
            authForms.forEach(f => f.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${targetTab}Form`).classList.add('active');
        });
    });

    // Inscription
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const userData = {
                id: Date.now(),
                nom: formData.get('nom'),
                prenom: formData.get('prenom'),
                email: formData.get('email'),
                telephone: formData.get('telephone'),
                password: formData.get('password'),
                notificationsEnabled: formData.get('notifications') === 'on',
                isAdmin: false
            };

            if (formData.get('password') !== formData.get('password-confirm')) {
                toastr.error('Les mots de passe ne correspondent pas');
                return;
            }

            if (users.some(user => user.email === userData.email)) {
                toastr.error('Cet email est déjà utilisé');
                return;
            }

            // Ajouter l'utilisateur
            users.push(userData);
            localStorage.setItem('users', JSON.stringify(users));
            currentUser = userData;
            
            // Envoyer l'email de bienvenue et afficher la notification
            await sendWelcomeEmail(userData);
            showWelcomeNotification(userData);
            
            // Mettre à jour l'interface
            updateAuthUI();
            closeAccountModal();
        });
    }

    // Connexion
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const email = formData.get('email');
            const password = formData.get('password');

            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                currentUser = user;
                updateAuthUI();
                closeAccountModal();
                toastr.success('Connexion réussie !');
            } else {
                toastr.error('Email ou mot de passe incorrect');
            }
        });
    }

    // Fonction pour gérer les transitions de section
    function switchSection(sectionId) {
        if (isAnimating) return;
        isAnimating = true;

        // Fermer la modale de compte si elle est ouverte
        closeAccountModal();

        // Masquer la page d'accueil si elle est visible
        if (landingPage.style.display !== 'none') {
            landingPage.style.animation = 'fadeOutUp 0.6s ease forwards';
            setTimeout(() => {
                landingPage.style.display = 'none';
            }, 600);
        }

        // Si une section est déjà active, la masquer avec animation
        if (currentSection) {
            currentSection.style.animation = 'fadeOutLeft 0.6s ease forwards';
            setTimeout(() => {
                currentSection.style.display = 'none';
                showNewSection();
            }, 600);
        } else {
            showNewSection();
        }

        function showNewSection() {
            // Masquer toutes les sections
            sections.forEach(section => {
                section.classList.remove('active');
                section.style.animation = '';
            });

            // Afficher la section sélectionnée
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                currentSection = targetSection;
                targetSection.style.display = 'block';
                targetSection.style.animation = 'fadeInRight 0.8s ease forwards';
                
                // Animer les cartes des membres
                const cards = targetSection.querySelectorAll('.member-card, .event-card');
                cards.forEach((card, index) => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.transition = 'all 0.5s ease';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 100 * (index + 1));
                });

                targetSection.classList.add('active');
                
                // Mettre à jour la barre latérale
                sideNavItems.forEach(item => {
                    item.classList.remove('active');
                    if (item.getAttribute('data-section') === sectionId) {
                        item.classList.add('active');
                    }
                });
            }

            isAnimating = false;
        }
    }

    // Gestionnaire de clic pour les éléments de navigation
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.getAttribute('data-section');
            if (sectionId) {
                switchSection(sectionId);
            }
        });
    });

    // Gestionnaire de clic pour la navigation latérale
    sideNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const sectionId = item.getAttribute('data-section');
            if (sectionId && sectionId !== 'account') {
                switchSection(sectionId);
            }
        });
    });

    // Gestion du retour à l'accueil
    function handleBackToHome() {
        if (isAnimating) return;
        isAnimating = true;

        if (currentSection) {
            currentSection.style.animation = 'fadeOutRight 0.6s ease forwards';
            
            setTimeout(() => {
                currentSection.style.display = 'none';
                currentSection.classList.remove('active');
                currentSection = null;

                // Réafficher la page d'accueil avec animation
                landingPage.style.display = 'flex';
                landingPage.style.animation = 'fadeInLeft 0.8s ease forwards';

                // Réinitialiser la navigation latérale
                sideNavItems.forEach(item => item.classList.remove('active'));

                isAnimating = false;
            }, 600);
        }
    }

    // Gestionnaire de clic pour les boutons retour
    backButtons.forEach(button => {
        button.addEventListener('click', handleBackToHome);
    });

    // Gestion des événements
    const eventForm = document.getElementById('eventForm');
    const eventsList = document.querySelector('.event-cards');
    
    // Charger les événements depuis le localStorage
    events = JSON.parse(localStorage.getItem('events') || '[]');

    // Fonction pour afficher les événements
    function displayEvents() {
        if (!eventsList) return;
        
        eventsList.innerHTML = '';
        events.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        events.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            
            const date = new Date(event.date);
            const formattedDate = date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            eventCard.innerHTML = `
                <h4 class="event-title">${event.title}</h4>
                <div class="event-date">${formattedDate}</div>
                <p class="event-description">${event.description}</p>
            `;
            
            eventsList.appendChild(eventCard);
            
            // Animation d'apparition
            setTimeout(() => {
                eventCard.style.opacity = '1';
                eventCard.style.transform = 'translateY(0)';
            }, 100);
        });
    }

    // Gestion du formulaire d'ajout d'événement
    if (eventForm) {
        eventForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!currentUser) {
                toastr.error('Vous devez être connecté pour ajouter un événement');
                return;
            }
            
            const eventData = {
                id: Date.now(),
                title: document.getElementById('eventTitle').value,
                date: document.getElementById('eventDate').value,
                description: document.getElementById('eventDescription').value,
                createdBy: currentUser.id
            };
            
            // Ajouter l'événement
            events.push(eventData);
            localStorage.setItem('events', JSON.stringify(events));
            
            // Notifier tous les utilisateurs inscrits
            const subscribedUsers = users.filter(user => user.notificationsEnabled);
            if (subscribedUsers.length > 0) {
                try {
                    // Envoyer les notifications (simulé pour l'instant)
                    subscribedUsers.forEach(user => {
                        toastr.info(`Notification envoyée à ${user.email} pour l'événement : ${eventData.title}`);
                    });
                } catch (error) {
                    console.error('Erreur lors de l\'envoi des notifications:', error);
                }
            }
            
            // Afficher une notification de succès
            toastr.success('Événement ajouté avec succès !');
            
            // Réinitialiser le formulaire
            eventForm.reset();
            
            // Mettre à jour l'affichage
            displayEvents();
        });
    }

    // Afficher les événements au chargement
    displayEvents();

    // Gestion des paramètres du compte
    const settingsTabs = document.querySelectorAll('.settings-tab');
    const settingsForms = document.querySelectorAll('.settings-form');
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');
    const deleteAccountBtn = document.getElementById('deleteAccount');
    const saveNotificationsBtn = document.getElementById('saveNotifications');

    // Fonction pour afficher les paramètres du compte
    function showAccountSettings() {
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById('accountSettings').classList.add('active');
        
        // Remplir les champs du profil avec les données actuelles
        if (currentUser) {
            document.getElementById('updateNom').value = currentUser.nom;
            document.getElementById('updatePrenom').value = currentUser.prenom;
            document.getElementById('updateEmail').value = currentUser.email;
            document.getElementById('updateTel').value = currentUser.telephone;
            
            // Remplir les préférences de notifications
            document.getElementById('eventNotifications').checked = currentUser.notificationsEnabled;
            document.getElementById('newsNotifications').checked = currentUser.newsNotificationsEnabled || false;
        }
    }

    // Gestionnaire d'onglets des paramètres
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetSettings = tab.getAttribute('data-settings');
            settingsTabs.forEach(t => t.classList.remove('active'));
            settingsForms.forEach(f => f.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`${targetSettings}Form`).classList.add('active');
        });
    });

    // Mise à jour du profil
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentUser) return;

            const updatedData = {
                ...currentUser,
                nom: document.getElementById('updateNom').value,
                prenom: document.getElementById('updatePrenom').value,
                email: document.getElementById('updateEmail').value,
                telephone: document.getElementById('updateTel').value
            };

            // Vérifier si l'email est déjà utilisé par un autre utilisateur
            const emailExists = users.some(u => u.email === updatedData.email && u.id !== currentUser.id);
            if (emailExists) {
                toastr.error('Cet email est déjà utilisé par un autre compte');
                return;
            }

            // Mettre à jour l'utilisateur
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex] = updatedData;
                currentUser = updatedData;
                localStorage.setItem('users', JSON.stringify(users));
                toastr.success('Profil mis à jour avec succès');
                updateAuthUI();
            }
        });
    }

    // Changement de mot de passe
    if (passwordForm) {
        passwordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!currentUser) return;

            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;

            // Vérifier le mot de passe actuel
            if (currentPassword !== currentUser.password) {
                toastr.error('Mot de passe actuel incorrect');
                return;
            }

            // Vérifier que les nouveaux mots de passe correspondent
            if (newPassword !== confirmNewPassword) {
                toastr.error('Les nouveaux mots de passe ne correspondent pas');
                return;
            }

            // Mettre à jour le mot de passe
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].password = newPassword;
                currentUser.password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
                toastr.success('Mot de passe modifié avec succès');
                passwordForm.reset();
            }
        });
    }

    // Gestion des notifications
    if (saveNotificationsBtn) {
        saveNotificationsBtn.addEventListener('click', () => {
            if (!currentUser) return;

            const eventNotifs = document.getElementById('eventNotifications').checked;
            const newsNotifs = document.getElementById('newsNotifications').checked;

            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].notificationsEnabled = eventNotifs;
                users[userIndex].newsNotificationsEnabled = newsNotifs;
                currentUser.notificationsEnabled = eventNotifs;
                currentUser.newsNotificationsEnabled = newsNotifs;
                localStorage.setItem('users', JSON.stringify(users));
                toastr.success('Préférences de notifications mises à jour');
            }
        });
    }

    // Suppression du compte
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', () => {
            if (!currentUser) return;

            const password = document.getElementById('deleteConfirmPassword').value;
            if (password !== currentUser.password) {
                toastr.error('Mot de passe incorrect');
                return;
            }

            if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
                // Supprimer l'utilisateur
                const userIndex = users.findIndex(u => u.id === currentUser.id);
                if (userIndex !== -1) {
                    users.splice(userIndex, 1);
                    localStorage.setItem('users', JSON.stringify(users));
                    currentUser = null;
                    updateAuthUI();
                    closeAccountModal();
                    toastr.success('Votre compte a été supprimé');
                }
            }
        });
    }

    // Modifier la fonction updateAuthUI pour gérer l'affichage des paramètres
    function updateAuthUI() {
        const authButtonText = document.querySelector('#authButton span');
        const addEventForm = document.getElementById('addEventForm');
        const accountTabs = document.querySelector('.account-tabs');
        
        if (currentUser) {
            authButtonText.textContent = `${currentUser.prenom}`;
            if (addEventForm) {
                addEventForm.style.display = 'block';
            }
            // Afficher les paramètres du compte au lieu du login/register
            if (accountTabs) {
                accountTabs.style.display = 'none';
            }
            showAccountSettings();
        } else {
            authButtonText.textContent = 'Compte';
            if (addEventForm) {
                addEventForm.style.display = 'none';
            }
            if (accountTabs) {
                accountTabs.style.display = 'flex';
            }
        }
    }

    // Gestionnaire d'événements pour la touche Echap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && accountSection.classList.contains('active')) {
            closeAccountModal();
        }
    });

    // Initialisation de l'interface utilisateur
    updateAuthUI();

    // Ajouter l'option de notification dans le profil utilisateur
    function updateUserNotificationPreferences(enabled) {
        if (!currentUser) return;
        
        currentUser.notificationsEnabled = enabled;
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('users', JSON.stringify(users));
            toastr.success(enabled ? 
                'Vous recevrez désormais des notifications pour les nouveaux événements' : 
                'Les notifications ont été désactivées');
        }
    }

    // Ajouter le toggle des notifications dans le formulaire d'inscription
    if (registerForm) {
        const notificationToggle = document.createElement('div');
        notificationToggle.className = 'form-group';
        notificationToggle.innerHTML = `
            <label class="checkbox-label">
                <input type="checkbox" name="notifications" checked>
                Recevoir des notifications pour les nouveaux événements
            </label>
        `;
        registerForm.insertBefore(notificationToggle, registerForm.querySelector('button'));
    }

    // Fonction pour gérer l'inscription
    function handleRegister(e) {
        e.preventDefault();
        const nom = document.getElementById('register-nom').value;
        const prenom = document.getElementById('register-prenom').value;
        const email = document.getElementById('register-email').value;
        const telephone = document.getElementById('register-telephone').value;
        const password = document.getElementById('register-password').value;
        const notificationsEnabled = document.getElementById('notifications-toggle').checked;

        const user = {
            nom,
            prenom,
            email,
            telephone,
            password,
            notificationsEnabled,
            isAdmin: false,
            createdAt: new Date().toISOString()
        };

        // Stocker l'utilisateur dans localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));

        // Connecter l'utilisateur
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Fermer le modal et mettre à jour l'interface
        closeAccountModal();
        updateUIForLoggedInUser(user);
        
        // Afficher un message de succès
        showNotification('Inscription réussie !', 'success');
    }

    // Fonction pour ajouter un événement
    function addEvent(event) {
        const events = JSON.parse(localStorage.getItem('events') || '[]');
        events.push(event);
        localStorage.setItem('events', JSON.stringify(events));

        // Notifier les utilisateurs qui ont activé les notifications
        notifyUsersAboutNewEvent(event);
    }

    // Fonction pour notifier les utilisateurs d'un nouvel événement
    function notifyUsersAboutNewEvent(event) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const usersToNotify = users.filter(user => user.notificationsEnabled);

        usersToNotify.forEach(user => {
            // Simuler l'envoi d'une notification
            console.log(`Notification envoyée à ${user.email} pour l'événement : ${event.title}`);
            showNotification(`Nouvel événement : ${event.title}`, 'info');
        });
    }

    // Fonction pour afficher une notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animer l'apparition
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Supprimer après 3 secondes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Fonction pour envoyer un email de bienvenue
    async function sendWelcomeEmail(user) {
        try {
            await emailjs.send(
                'service_d5avvat', // Votre Service ID Gmail
                'template_hv30nek', // Votre Template ID
                {
                    to_name: `${user.prenom} ${user.nom}`,
                    to_email: user.email,
                    message: "Bienvenue dans la pachas family, tu seras maintenant au courant de nos prochains events !!"
                }
            );
            console.log('Email de bienvenue envoyé avec succès !');
            toastr.success('Email de bienvenue envoyé !');
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            toastr.error('Erreur lors de l\'envoi de l\'email de bienvenue');
        }
    }

    // Fonction pour afficher la notification de bienvenue
    function showWelcomeNotification(user) {
        const notification = document.createElement('div');
        notification.className = 'notification welcome';
        notification.innerHTML = `
            <div class="welcome-content">
                <h3>🎉 Bienvenue ${user.prenom} !</h3>
                <p>Bienvenue dans la pachas family, tu seras maintenant au courant de nos prochains events !!</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animation d'entrée
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // Animation de sortie après 5 secondes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 5000);
    }
}); 