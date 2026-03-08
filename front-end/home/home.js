// Script pour la page d'accueil - VERSION DEBUGGÉE

console.log('🎮 home.js chargé !');

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM chargé, initialisation...');
    
    const authSection = document.getElementById('auth-section');
    const userSection = document.getElementById('user-section');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    console.log('📋 Éléments trouvés:', {
        authSection: !!authSection,
        userSection: !!userSection,
        loginForm: !!loginForm,
        registerForm: !!registerForm
    });
    
    // Vérifier si l'utilisateur est déjà connecté
    if (isAuthenticated()) {
        console.log('👤 Utilisateur déjà connecté');
        showUserSection();
    } else {
        console.log('🔓 Utilisateur non connecté');
        showAuthSection();
    }
    
    // Toggle entre connexion et inscription
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('📝 Affichage formulaire inscription');
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            clearErrors();
        });
    }
    
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔑 Affichage formulaire connexion');
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            clearErrors();
        });
    }
    
    // ✅ FORMULAIRE DE CONNEXION
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('🔑 Soumission formulaire connexion');
            
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            const errorDiv = document.getElementById('login-error');
            
            console.log('📧 Email:', email);
            
            errorDiv.textContent = '';
            errorDiv.classList.remove('active');
            
            // Validation basique
            if (!email || !password) {
                console.error('❌ Champs vides');
                errorDiv.textContent = 'Veuillez remplir tous les champs';
                errorDiv.classList.add('active');
                return;
            }
            
            try {
                const submitBtn = e.target.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Connexion en cours...';
                
                console.log('📡 Appel API login...');
                await login(email, password);
                
                console.log('✅ Connexion réussie !');
                showUserSection();
                
            } catch (error) {
                console.error('❌ Erreur connexion:', error);
                errorDiv.textContent = error.message;
                errorDiv.classList.add('active');
            } finally {
                const submitBtn = e.target.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Se connecter';
            }
        });
    }
    
    // ✅ FORMULAIRE D'INSCRIPTION - CORRIGÉ
    const formRegister = document.getElementById('form-register');
    if (formRegister) {
        console.log('📝 Event listener inscription attaché');
        
        formRegister.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('🆕 Soumission formulaire inscription');
            
            const name = document.getElementById('register-name').value.trim();
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const confirm = document.getElementById('register-confirm').value;
            const errorDiv = document.getElementById('register-error');
            
            console.log('📋 Données inscription:', { name, email, passwordLength: password.length });
            
            errorDiv.textContent = '';
            errorDiv.classList.remove('active');
            
            // ✅ Validation complète
            if (!name || !email || !password || !confirm) {
                console.error('❌ Champs vides');
                errorDiv.textContent = 'Veuillez remplir tous les champs';
                errorDiv.classList.add('active');
                return;
            }
            
            if (password !== confirm) {
                console.error('❌ Mots de passe différents');
                errorDiv.textContent = 'Les mots de passe ne correspondent pas';
                errorDiv.classList.add('active');
                return;
            }
            
            if (password.length < 8) {
                errorDiv.textContent = 'Le mot de passe doit contenir au moins 8 caractères (majuscule, minuscule, chiffre)';
                return;
            }
            
            // Vérification regex pour le mdp:
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
            if (!passwordRegex.test(password)) {
                errorDiv.textContent = 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre';
                return;
            }

            // Validation email basique
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                console.error('❌ Email invalide');
                errorDiv.textContent = 'Email invalide';
                errorDiv.classList.add('active');
                return;
            }
            
            try {
                const submitBtn = e.target.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Inscription en cours...';
                
                console.log('📡 Appel API register...');
                console.log('🔗 URL:', `${API_BASE_URL}/auth/validateRegistration`);
                
                const result = await register(name, email, password);
                
                console.log('✅ Inscription réussie !', result);
                
                // ✅ Afficher message de succès
                await customAlert(
                    'Inscription réussie ! Vous pouvez maintenant vous connecter.',
                    'success',
                    'Bienvenue !'
                );
                
                // ✅ Rediriger vers le formulaire de connexion
                registerForm.style.display = 'none';
                loginForm.style.display = 'block';
                
                // Pré-remplir l'email
                document.getElementById('login-email').value = email;
                
            } catch (error) {
                console.error('❌ Erreur inscription:', error);
                console.error('Stack:', error.stack);
                errorDiv.textContent = error.message || 'Erreur lors de l\'inscription';
                errorDiv.classList.add('active');
            } finally {
                const submitBtn = e.target.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.textContent = 'S\'inscrire';
            }
        });
    } else {
        console.error('❌ Formulaire inscription introuvable !');
    }
    
    // Bouton de déconnexion
    const logoutBtn = document.getElementById('btn-logout-home');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log('👋 Déconnexion');
            logout();
            showAuthSection();
        });
    }
});

function showAuthSection() {
    console.log('📄 Affichage section auth');
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('user-section').style.display = 'none';
}

function showUserSection() {
    console.log('👤 Affichage section utilisateur');
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('user-section').style.display = 'block';
    
    const user = getCurrentUser();
    if (user) {
        const userNameElement = document.getElementById('user-name');
        if (userNameElement) {
            userNameElement.textContent = user.username || user.name || user.email;
        }
    }
}

function clearErrors() {
    console.log('🧹 Nettoyage erreurs');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');
    
    if (loginError) {
        loginError.textContent = '';
        loginError.classList.remove('active');
    }
    
    if (registerError) {
        registerError.textContent = '';
        registerError.classList.remove('active');
    }
}

console.log('✅ home.js initialisé');