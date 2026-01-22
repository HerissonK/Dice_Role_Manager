// Gestion de l'authentification

// Configuration API
const API_BASE_URL = 'http://localhost:3000/api';

// Vérifier si l'utilisateur est connecté
function isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return token !== null;
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
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
}

// Supprimer la session
function clearSession() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
}

// Connexion
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la connexion');
        }

        const data = await response.json();
        
        // Sauvegarder le token et les infos utilisateur
        saveSession(data.token, data.user);
        
        return data;
    } catch (error) {
        throw error;
    }
}

// Inscription
async function register(name, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de l\'inscription');
        }

        const data = await response.json();
        
        // Sauvegarder le token et les infos utilisateur
        saveSession(data.token, data.user);
        
        return data;
    } catch (error) {
        throw error;
    }
}

// Déconnexion
function logout() {
    clearSession();
    window.location.href = 'index.html';
}

// Protéger une page (rediriger si non connecté)
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Fetch avec authentification
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();
    
    if (!token) {
        throw new Error('Non authentifié');
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };
    
    const response = await fetch(url, {
        ...options,
        headers
    });
    
    // Si 401, déconnecter l'utilisateur
    if (response.status === 401) {
        clearSession();
        window.location.href = 'index.html';
        throw new Error('Session expirée');
    }
    
    return response;
}
