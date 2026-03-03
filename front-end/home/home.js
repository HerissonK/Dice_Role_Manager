// Script pour la page d'accueil

document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('auth-section');
    const userSection = document.getElementById('user-section');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Vérifier si l'utilisateur est déjà connecté
    if (isAuthenticated()) {
        showUserSection();
    } else {
        showAuthSection();
    }
    
    // Toggle entre connexion et inscription
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        clearErrors();
    });
    
    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
        clearErrors();
    });
    
    // Formulaire de connexion
    document.getElementById('form-login').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorDiv = document.getElementById('login-error');
        
        errorDiv.textContent = '';
        
        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Connexion en cours...';
            
            await login(email, password);
            
            // Rediriger vers la section utilisateur
            showUserSection();
            
        } catch (error) {
            errorDiv.textContent = error.message;
        } finally {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Se connecter';
        }
    });
    
    // Formulaire d'inscription
    document.getElementById('form-register').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        const errorDiv = document.getElementById('register-error');
        
        errorDiv.textContent = '';
        
        // Vérifier que les mots de passe correspondent
        if (password !== confirm) {
            errorDiv.textContent = 'Les mots de passe ne correspondent pas';
            return;
        }
        
        // Vérifier la longueur du mot de passe
        if (password.length < 6) {
            errorDiv.textContent = 'Le mot de passe doit contenir au moins 6 caractères';
            return;
        }
        
        try {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Inscription en cours...';
            
            await register(name, email, password);
            
            // Rediriger vers la section utilisateur
            showUserSection();
            
        } catch (error) {
            errorDiv.textContent = error.message;
        } finally {
            const submitBtn = e.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'S\'inscrire';
        }
    });
    
    // Bouton de déconnexion
    const logoutBtn = document.getElementById('btn-logout-home');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            logout();
            showAuthSection();
        });
    }
});

function showAuthSection() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('user-section').style.display = 'none';
}

function showUserSection() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('user-section').style.display = 'block';
    
    const user = getCurrentUser();
    if (user) {
        document.getElementById('user-name').textContent = user.name || user.email;
    }
}

function clearErrors() {
    document.getElementById('login-error').textContent = '';
    document.getElementById('register-error').textContent = '';
}
