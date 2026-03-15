// Gestion de l'authentification - VERSION CORRIGÉE

const API_BASE_URL = 'http://localhost:3000/api';

console.log('🔐 auth.js chargé, API_BASE_URL:', API_BASE_URL);

// Vérifier si l'utilisateur est connecté
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const isAuth = token !== null;
    console.log('🔍 isAuthenticated:', isAuth);
    return isAuth;
}

// Récupérer le token
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Récupérer les infos de l'utilisateur
function getCurrentUser() {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
}

// Sauvegarder la session
function saveSession(token, user) {
    console.log('💾 Sauvegarde session:', { token: token ? 'present' : 'absent', user });
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Supprimer la session
function clearSession() {
    console.log('🗑️ Suppression session');
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
}

// ✅ CONNEXION
async function login(email, password) {
    console.log('🔑 login() appelé avec:', { email });
    
    try {
        const url = `${API_BASE_URL}/auth/login`;
        console.log('📡 POST', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        console.log('📥 Réponse reçue, status:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Erreur API:', errorData);
            throw new Error(errorData.error || 'Erreur lors de la connexion');
        }

        const data = await response.json();
        console.log('✅ Données reçues:', { ...data, token: data.token ? 'present' : 'absent' });

        // Sauvegarder le token et les infos utilisateur
        saveSession(data.token, data.user);

        return data;
    } catch (error) {
        console.error('💥 Erreur login:', error);
        throw error;
    }
}

// ✅ INSCRIPTION - URL CORRIGÉE
async function register(username, email, password) {
    console.log('📝 register() appelé avec:', { username, email });
    
    try {
        // ✅ CORRECTION : Utilise /register au lieu de /validateRegistration
        const url = `${API_BASE_URL}/auth/register`;
        console.log('📡 POST', url);
        
        const body = { username, email, password };
        console.log('📦 Body:', body);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(body)
        });

        console.log('📥 Réponse reçue, status:', response.status);

        // ✅ Lire la réponse une seule fois
        const responseText = await response.text();
        console.log('📄 Réponse brute:', responseText);
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('❌ Impossible de parser le JSON:', e);
            console.error('Contenu reçu:', responseText);
            
            // Si c'est un HTML (404), donner un message plus clair
            if (responseText.includes('<!DOCTYPE')) {
                throw new Error('Route d\'inscription introuvable sur le serveur. Vérifiez que /api/auth/register existe.');
            }
            
            throw new Error('Réponse invalide du serveur');
        }

        if (!response.ok) {
            console.error('❌ Erreur API:', data);
            throw new Error(data.error || data.message || 'Erreur lors de l\'inscription');
        }

        console.log('✅ Inscription réussie:', data);

        // ⚠️ Si le serveur renvoie un token à l'inscription, sauvegarder la session
        if (data.token && data.user) {
            console.log('🎫 Token reçu à l\'inscription, sauvegarde session');
            saveSession(data.token, data.user);
        }

        return data;
        
    } catch (error) {
        console.error('💥 Erreur register:', error);
        throw error;
    }
}

// Déconnexion
function logout() {
    console.log('👋 logout()');
    clearSession();
    window.location.href = '/front-end/home/home.html';
}

// Protéger une page (rediriger si non connecté)
function requireAuth() {
    console.log('🔒 requireAuth()');
    if (!isAuthenticated()) {
        console.warn('⚠️ Non authentifié, redirection...');
        window.location.href = '/front-end/home/home.html';
        return false;
    }
    return true;
}

// ✅ Fetch avec authentification
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();

    if (!token) {
        console.error('❌ Pas de token');
        throw new Error('Non authentifié');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    console.log('📡 authenticatedFetch:', url);

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        console.error('❌ Token invalide ou expiré');
        clearSession();
        window.location.href = '/front-end/home/home.html';
        throw new Error('Session expirée');
    }

    return response;
}

console.log('✅ auth.js initialisé');