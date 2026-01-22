// Script pour la page de liste des personnages

document.addEventListener('DOMContentLoaded', () => {
    // Vérifier l'authentification
    if (!requireAuth()) {
        return;
    }
    
    // Charger les personnages
    loadCharacters();
    
    // Bouton de déconnexion
    document.getElementById('btn-logout').addEventListener('click', logout);
});

// Charger la liste des personnages
async function loadCharacters() {
    const loadingMessage = document.getElementById('loading-message');
    const emptyMessage = document.getElementById('empty-message');
    const charactersGrid = document.getElementById('characters-grid');
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/characters`);
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des personnages');
        }
        
        const characters = await response.json();
        
        loadingMessage.style.display = 'none';
        
        if (characters.length === 0) {
            emptyMessage.style.display = 'block';
        } else {
            charactersGrid.style.display = 'grid';
            displayCharacters(characters);
        }
        
    } catch (error) {
        console.error('Erreur:', error);
        loadingMessage.innerHTML = `
            <div class="error-message">
                <p>Erreur lors du chargement des personnages</p>
                <p class="text-sm">${error.message}</p>
            </div>
        `;
    }
}

// Afficher les personnages
function displayCharacters(characters) {
    const grid = document.getElementById('characters-grid');
    
    grid.innerHTML = characters.map(character => `
        <div class="card character-card p-6">
            <div class="character-card-header">
                <div>
                    <h3 class="mb-2">${character.name}</h3>
                    <p class="text-gray-600 text-sm">
                        ${character.species} ${character.class} - Niveau ${character.level}
                    </p>
                </div>
            </div>
            
            <div class="character-card-body mt-4">
                <div class="character-stats">
                    <div class="stat-item">
                        <span class="stat-label">PV</span>
                        <span class="stat-value">${character.hp || '?'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">CA</span>
                        <span class="stat-value">${character.ac || '?'}</span>
                    </div>
                </div>
                
                <div class="separator mt-4 mb-4"></div>
                
                <p class="text-sm text-gray-600 mb-2">
                    <strong>Historique:</strong> ${character.background}
                </p>
                
                ${character.created_at ? `
                    <p class="text-xs text-gray-500">
                        Créé le ${new Date(character.created_at).toLocaleDateString('fr-FR')}
                    </p>
                ` : ''}
            </div>
            
            <div class="character-card-actions">
                <button 
                    class="btn btn-outline btn-sm" 
                    onclick="viewCharacter(${character.id})"
                >
                    <svg class="icon"><use href="#icon-eye"/></svg>
                    Voir
                </button>
                <button 
                    class="btn btn-outline btn-sm" 
                    onclick="deleteCharacter(${character.id}, '${character.name.replace(/'/g, "\\'")}')"
                >
                    <svg class="icon"><use href="#icon-trash"/></svg>
                    Supprimer
                </button>
            </div>
        </div>
    `).join('');
}

// Voir un personnage en détail
async function viewCharacter(characterId) {
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/characters/${characterId}`);
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement du personnage');
        }
        
        const character = await response.json();
        showCharacterModal(character);
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors du chargement du personnage');
    }
}

// Afficher le modal avec les détails du personnage
function showCharacterModal(character) {
    const modal = document.getElementById('character-modal');
    const modalName = document.getElementById('modal-character-name');
    const modalBody = document.getElementById('modal-body');
    
    modalName.textContent = character.name;
    
    // Calculer les modificateurs
    const abilities = character.abilities || {};
    const getModifier = (score) => Math.floor((score - 10) / 2);
    
    modalBody.innerHTML = `
        <div class="character-details">
            <div class="detail-section">
                <h4>Informations générales</h4>
                <p><strong>Espèce:</strong> ${character.species}</p>
                <p><strong>Classe:</strong> ${character.class}</p>
                <p><strong>Niveau:</strong> ${character.level}</p>
                <p><strong>Historique:</strong> ${character.background}</p>
            </div>
            
            <div class="separator"></div>
            
            <div class="detail-section">
                <h4>Caractéristiques</h4>
                <div class="abilities-grid">
                    ${Object.entries(abilities).map(([ability, value]) => {
                        const modifier = getModifier(value);
                        const abilityLabel = {
                            strength: 'Force',
                            dexterity: 'Dextérité',
                            constitution: 'Constitution',
                            intelligence: 'Intelligence',
                            wisdom: 'Sagesse',
                            charisma: 'Charisme'
                        }[ability] || ability;
                        
                        return `
                            <div class="ability-item">
                                <span class="ability-label">${abilityLabel}</span>
                                <span class="ability-score">${value}</span>
                                <span class="ability-modifier">${modifier >= 0 ? '+' : ''}${modifier}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    
    // Fermer le modal
    document.getElementById('modal-close').onclick = () => {
        modal.style.display = 'none';
    };
    
    document.getElementById('modal-overlay').onclick = () => {
        modal.style.display = 'none';
    };
}

// Supprimer un personnage
async function deleteCharacter(characterId, characterName) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${characterName} ?`)) {
        return;
    }
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/characters/${characterId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression');
        }
        
        // Recharger la liste
        loadCharacters();
        
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression du personnage');
    }
}
