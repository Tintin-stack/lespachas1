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
    });

    // Fermer le modal
    closeAccount.addEventListener('click', function() {
        accountSection.style.display = 'none';
        overlay.style.display = 'none';
    });

    overlay.addEventListener('click', function() {
        accountSection.style.display = 'none';
        overlay.style.display = 'none';
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
    });

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetSection = this.dataset.section;
            if (targetSection) {
                landingPage.style.display = 'none';
                sections.forEach(section => {
                    if (section.id === targetSection) {
                        section.style.display = 'block';
                    } else {
                        section.style.display = 'none';
                    }
                });
            }
        });
    });

    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            landingPage.style.display = 'flex';
            sections.forEach(section => {
                section.style.display = 'none';
            });
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
}); 