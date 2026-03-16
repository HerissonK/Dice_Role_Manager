/**
 * Alert personnalisé
 * @param {string} message - Le message à afficher
 * @param {string} type - 'success', 'warning', 'danger', 'info'
 * @param {string} title - Titre du modal (optionnel)
 */

// Script pour la page de liste des personnages
function abilityModifier(score) {
    return Math.floor((score - 10) / 2);
}

function getAttackAbilityMod(weapon, abilities) {
    if (weapon.category?.includes('ranged')) {
        return abilityModifier(abilities.dex);
    }

    if (weapon.properties?.includes('finesse')) {
        return Math.max(
            abilityModifier(abilities.str),
            abilityModifier(abilities.dex)
        );
    }

    return abilityModifier(abilities.str);
}


document.addEventListener('DOMContentLoaded', () => {
    // Vérifier l'authentification
    if (!requireAuth()) {
        return;
    }
    
    // Charger les personnages
    loadCharacters();
    
    // Bouton de déconnexion
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
});

// Charger la liste des personnages
async function loadCharacters() {
    const loadingMessage = document.getElementById('loading-message');
    const emptyMessage = document.getElementById('empty-message');
    const charactersGrid = document.getElementById('characters-grid');
    
    // Reset complet avant chaque chargement
    loadingMessage.style.display = 'block';
    emptyMessage.style.display = 'none';
    charactersGrid.style.display = 'none';
    charactersGrid.innerHTML = '';
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/characters`);
        
        if (!response.ok) {
            throw new Error('Erreur lors du chargement des personnages');
        }
        
        const characters = await response.json();
        
        console.log('📋 Personnages chargés:', characters);
        
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

/**
 * Rediriger vers la page de jeu
 * ✅ FIX: Utilise 'play' au lieu de 'play.html' pour serveur sans extension
 */
function playCharacter(id) {
    console.log('🎲 playCharacter appelé avec id:', id);
    console.log('📍 Type de id:', typeof id);
    
    if (!id) {
        console.error('❌ ID manquant!');
        alert('Erreur: ID du personnage manquant');
        return;
    }
    
    // ✅ CORRECTION: pas de .html car le serveur retire les extensions
    const url = `play?id=${id}`;
    console.log('🔗 Redirection vers:', url);
    window.location.href = url;
}

// Afficher les personnages avec le nouveau design
function displayCharacters(characters) {
    const grid = document.getElementById('characters-grid');
    
    // Construire le HTML
    const html = characters.map(character => {
        console.log('🎭 Affichage personnage:', character.id, character.name);
        
        // Calculer des stats supplémentaires
        const createdDate = character.created_at 
            ? new Date(character.created_at).toLocaleDateString('fr-FR', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })
            : 'N/A';
        
        return `
        <div class="card character-card" data-class="${character.class}">
            <div class="character-card-content">
                <div class="character-card-main">
                    <!-- NOM EN HERO -->
                    <h3 class="character-name-hero">${character.name}</h3>
                    
                    <!-- CLASSE + NIVEAU BADGE -->
                    <div class="character-class-badge">
                            ${character.class} • Niveau ${character.level}
                    </div>
                    
                    <!-- META : Espèce + Background -->
                    <div class="character-meta">
                        <div class="character-meta-item">
                            <span class="character-meta-label">Espèce:</span>
                            ${character.species}
                        </div>
                        <div class="character-meta-item">
                            <span class="character-meta-label">Historique:</span>
                            ${character.background}
                        </div>
                    </div>
                    
                    <!-- STATS CLÉS -->
                    <div class="character-key-stats">
                        <div class="key-stat">
                            <div class="key-stat-label">Niveau</div>
                            <div class="key-stat-value level">${character.level}</div>
                        </div>
                        <div class="key-stat">
                            <div class="key-stat-label">PV</div>
                            <div class="key-stat-value hp">${character.pv ?? '?'}</div>
                        </div>
                        <div class="key-stat">
                            <div class="key-stat-label">XP</div>
                            <div class="key-stat-value">0</div>
                        </div>
                    </div>
                </div>
                
                <!-- FOOTER : Date + Actions -->
                <div class="character-card-footer">
                    <div class="character-created-date">
                        ${createdDate}
                    </div>
                    
                    <div class="character-card-actions">
                        <button 
                            class="btn btn-primary btn-sm btn-play"
                            data-character-id="${character.id}"
                            title="Jouer avec ce personnage"
                        >
                            Jouer
                        </button>
                        <button 
                            class="btn btn-outline btn-sm" 
                            onclick="viewCharacter(${character.id})"
                            title="Voir les détails"
                        >
                            <svg class="icon"><use href="#icon-eye"/></svg>
                        </button>
                        <button 
                            class="btn btn-outline btn-sm btn-rename"
                            data-character-id="${character.id}"
                            data-character-name="${character.name.replace(/"/g, '&quot;')}"
                            title="Renommer"
                        >
                            <svg class="icon"><use href="#icon-edit"/></svg>    
                        </button>
                        <button 
                            class="btn btn-outline btn-sm" 
                            onclick="deleteCharacter(${character.id}, '${character.name.replace(/'/g, "\\'")}')"
                            title="Supprimer"
                        >
                            <svg class="icon"><use href="#icon-trash"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');
    
    grid.innerHTML = html;
    
    // Ajouter les event listeners APRÈS avoir inséré le HTML
    const playButtons = grid.querySelectorAll('.btn-play');
    console.log('🎮 Nombre de boutons "Jouer" trouvés:', playButtons.length);
    
    playButtons.forEach((btn, index) => {
        const characterId = btn.getAttribute('data-character-id');
        console.log(`  → Bouton ${index + 1}: ID = ${characterId}`);
        
        btn.addEventListener('click', (event) => {
            console.log('🖱️ Clic sur bouton Play');
            playCharacter(characterId);
        });
    });
    const renameButtons = grid.querySelectorAll('.btn-rename');
    renameButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            renameCharacter(
                btn.getAttribute('data-character-id'),
                btn.getAttribute('data-character-name')
            );
        });
    });
    console.log('✅ Tous les event listeners configurés');
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
    const proficiencyBonus = 2;
    const weapons = (character.items || []).filter(
        i => i.damage_dice
    );    
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
                            str: 'Force',
                            dex: 'Dextérité',
                            con: 'Constitution',
                            int: 'Intelligence',
                            wis: 'Sagesse',
                            cha: 'Charisme'
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
            <div class="separator"></div>
            <div class="detail-section">
                <h4>Armes</h4>
                ${
                    weapons.length === 0
                        ? '<p class="text-sm text-gray-500">Aucune arme équipée</p>'
                        : `
                            <div class="weapons-grid">
                                ${weapons.map(w => {
                                    const attackMod = getAttackAbilityMod(w, abilities);
                                    const attackBonus = attackMod + proficiencyBonus;

                                    return `
                                        <div class="weapon-card">
                                            <strong>${w.name}</strong>
                                            <p class="text-sm">
                                                Attaque :
                                                <strong>${attackBonus >= 0 ? '+' : ''}${attackBonus}</strong>
                                            </p>
                                            <p class="text-sm">
                                                Dégâts :
                                                <strong>${w.damage_dice}</strong>
                                                (${w.damage_type})
                                                ${attackMod >= 0 ? '+' : ''}${attackMod}
                                            </p>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        `
                }
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

// Fonction de renommage
async function renameCharacter(characterId, currentName) {
  const modal = document.getElementById('rename-modal');
  const input = document.getElementById('rename-input');
  const form  = document.getElementById('rename-form');

  input.value = currentName;
  modal.style.display = 'flex';
  input.focus();
  input.select();

  return new Promise((resolve) => {
    form.onsubmit = async (e) => {
      e.preventDefault();
      const newName = input.value.trim();
      if (!newName) return;

      try {
        const response = await authenticatedFetch(
          `${API_BASE_URL}/characters/${characterId}/name`,
          { method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName }) }
        );
        if (!response.ok) throw new Error('Erreur lors du renommage');
        modal.style.display = 'none';
        loadCharacters();
      } catch (err) {
        await customAlert(err.message, 'danger', 'Erreur');
      }
      resolve();
    };

    document.getElementById('rename-cancel').onclick = () => {
      modal.style.display = 'none';
      resolve();
    };
    document.getElementById('rename-overlay').onclick = () => {
      modal.style.display = 'none';
      resolve();
    };
  });
}

// Supprimer un personnage
async function deleteCharacter(characterId, characterName) {
    // ✅ Popup stylisé de confirmation
    const confirmed = await customConfirm(
        `Voulez-vous vraiment supprimer "${characterName}" ?\n\nCette action est irréversible.`,
        {
            title: 'Supprimer le personnage',
            confirmText: 'Supprimer',
            cancelText: 'Annuler',
            type: 'danger'
        }
    );
    
    if (!confirmed) return;
    
    try {
        const response = await authenticatedFetch(`${API_BASE_URL}/characters/${characterId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression');
        }
        
        // ✅ Feedback de succès
        await customAlert(
            `Le personnage "${characterName}" a été supprimé avec succès.`,
            'success',
            'Suppression réussie'
        );
        
        // Recharger la liste
        loadCharacters();
        
    } catch (error) {
        console.error('Erreur:', error);
        await customAlert(
            error.message || 'Erreur lors de la suppression du personnage',
            'danger',
            'Erreur'
        );
    }
}