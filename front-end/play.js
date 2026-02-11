/**
 * Script pour la page de jeu du personnage
 * Version complète avec compétences
 */

console.log('🎲 Play page loaded');

/* =========================
   DONNÉES D&D
========================= */

const abilityNames = {
    str: 'Force',
    dex: 'Dextérité',
    con: 'Constitution',
    int: 'Intelligence',
    wis: 'Sagesse',
    cha: 'Charisme'
};

const abilityAbbrev = {
    str: 'FOR',
    dex: 'DEX',
    con: 'CON',
    int: 'INT',
    wis: 'SAG',
    cha: 'CHA'
};

// Compétences D&D avec leurs caractéristiques associées
const allSkills = [
    { name: 'Acrobaties', ability: 'dex' },
    { name: 'Dressage', ability: 'wis' },
    { name: 'Arcanes', ability: 'int' },
    { name: 'Athlétisme', ability: 'str' },
    { name: 'Tromperie', ability: 'cha' },
    { name: 'Histoire', ability: 'int' },
    { name: 'Intuition', ability: 'wis' },
    { name: 'Intimidation', ability: 'cha' },
    { name: 'Investigation', ability: 'int' },
    { name: 'Médecine', ability: 'wis' },
    { name: 'Nature', ability: 'int' },
    { name: 'Perception', ability: 'wis' },
    { name: 'Représentation', ability: 'cha' },
    { name: 'Persuasion', ability: 'cha' },
    { name: 'Religion', ability: 'int' },
    { name: 'Escamotage', ability: 'dex' },
    { name: 'Discrétion', ability: 'dex' },
    { name: 'Survie', ability: 'wis' }
];

/* =========================
   UTILS
========================= */

function getCharacterIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    console.log('🔍 ID depuis URL:', id);
    return id;
}

function abilityModifier(score) {
    return Math.floor((score - 10) / 2);
}

function getAuthHeaders() {
    const token = localStorage.getItem('authToken');

    if (!token) {
        throw new Error('Token manquant – utilisateur non connecté');
    }

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}

/* =========================
   ÉTAT
========================= */

const characterId = getCharacterIdFromUrl();
let currentCharacter = null;
const PROFICIENCY_BONUS = 2;

/* =========================
   INIT
========================= */

document.addEventListener('DOMContentLoaded', () => {
    // Vérifier l'authentification
    if (!requireAuth()) {
        return;
    }

    // Bouton de déconnexion
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    if (!characterId) {
        showError('❌ Aucun personnage spécifié dans l\'URL');
        console.error('❌ Aucun characterId dans l\'URL');
    } else {
        loadCharacter();
    }
});

/* =========================
   AFFICHAGE RÉSULTATS
========================= */

function showRollResult(text, type = 'success') {
    const banner = document.getElementById('roll-result-banner');
    const resultText = document.getElementById('roll-result-text');

    resultText.textContent = text;
    banner.style.display = 'block';
    banner.className = `roll-result-banner roll-result-${type}`;

    setTimeout(() => {
        banner.classList.add('show');
    }, 10);

    setTimeout(() => {
        banner.classList.remove('show');
        setTimeout(() => {
            banner.style.display = 'none';
        }, 300);
    }, 5000);
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');

    errorText.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    const errorDiv = document.getElementById('error-message');
    errorDiv.style.display = 'none';
}

/* =========================
   LOAD CHARACTER
========================= */

async function loadCharacter() {
    try {
        hideError();

        const response = await fetch(`http://localhost:3000/api/play/${characterId}`, {
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Personnage non trouvé');
            }
            if (response.status === 401) {
                throw new Error('Non authentifié. Veuillez vous reconnecter.');
            }
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }

        const character = await response.json();
        console.log('🎭 Character loaded:', character);

        currentCharacter = character;
        renderCharacter(character);

    } catch (err) {
        console.error('Erreur chargement personnage:', err);
        showError(err.message || 'Erreur lors du chargement du personnage');
    }
}

/* =========================
   RENDER CHARACTER
========================= */

function renderCharacter(character) {
    // Nom et classe
    document.getElementById('charName').textContent = character.name;
    document.getElementById('charClass').textContent = 
        `${character.species} ${character.class} - Niveau ${character.level}`;

    // Statistiques
    document.getElementById('charPV').textContent = character.pv || '?';
    document.getElementById('charAC').textContent = character.armorClass || '?';

    // Initiative (modificateur de Dextérité)
    const dexMod = abilityModifier(character.abilities?.dex || 10);
    document.getElementById('charInit').textContent = 
        `${dexMod >= 0 ? '+' : ''}${dexMod}`;

    // Caractéristiques
    renderAbilities(character.abilities);
    
    // ✨ NOUVEAU: Compétences
    renderSkills(character);
}

function renderAbilities(abilities) {
    const abilitiesDiv = document.getElementById('abilities');
    abilitiesDiv.innerHTML = '';

    if (!abilities) {
        abilitiesDiv.innerHTML = '<p class="text-gray-600">Aucune caractéristique disponible</p>';
        return;
    }

    Object.entries(abilities).forEach(([ability, value]) => {
        const mod = abilityModifier(value);
        const name = abilityNames[ability] || ability;
        const abbr = abilityAbbrev[ability] || ability.toUpperCase();

        const card = document.createElement('div');
        card.className = 'ability-card card-clickable';
        card.onclick = () => rollAbility(ability, mod, name);

        card.innerHTML = `
            <div class="ability-card-abbr">${abbr}</div>
            <div class="ability-card-score">${value}</div>
            <div class="badge badge-secondary">
                ${mod >= 0 ? '+' : ''}${mod}
            </div>
        `;

        abilitiesDiv.appendChild(card);
    });
}

/**
 * ✨ NOUVEAU: Afficher les compétences
 */
function renderSkills(character) {
    const skillsDiv = document.getElementById('skills');
    if (!skillsDiv) return;
    
    skillsDiv.innerHTML = '';

    if (!character.abilities) {
        skillsDiv.innerHTML = '<p class="text-gray-600">Aucune compétence disponible</p>';
        return;
    }

    // Récupérer les compétences maîtrisées du personnage
    const proficientSkills = character.skills || [];
    
    allSkills.forEach(skill => {
        const abilityScore = character.abilities[skill.ability];
        const mod = abilityModifier(abilityScore);
        const isProficient = proficientSkills.includes(skill.name);
        const totalBonus = mod + (isProficient ? PROFICIENCY_BONUS : 0);

        const skillCard = document.createElement('div');
        skillCard.className = `skill-card ${isProficient ? 'skill-proficient' : ''}`;
        skillCard.onclick = () => rollSkill(skill.name, skill.ability, totalBonus, isProficient);

        skillCard.innerHTML = `
            <div class="skill-card-content">
                <div class="skill-card-header">
                    <span class="skill-name">${skill.name}</span>
                    <span class="badge badge-outline badge-sm">${abilityAbbrev[skill.ability]}</span>
                </div>
                <div class="skill-card-bonus">
                    ${totalBonus >= 0 ? '+' : ''}${totalBonus}
                    ${isProficient ? '<span class="skill-proficiency-badge">★</span>' : ''}
                </div>
            </div>
        `;

        skillsDiv.appendChild(skillCard);
    });
}

/* =========================
   ROLLS - CARACTÉRISTIQUES
========================= */

async function rollAbility(ability, modifier, name) {
    try {
        const response = await fetch(`http://localhost:3000/api/play/${characterId}/roll/ability`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                ability, 
                value: modifier 
            }),
        });

        if (!response.ok) {
            throw new Error('Erreur lors du jet de caractéristique');
        }

        const data = await response.json();

        const total = data.roll + modifier;
        showRollResult(
            `🎲 ${name} (${ability.toUpperCase()}) : 1d20 = ${data.roll} ${modifier >= 0 ? '+' : ''}${modifier} = ${total}`,
            'success'
        );

        console.log('Roll result:', data);

    } catch (err) {
        console.error('Erreur jet de caractéristique:', err);
        showRollResult(`❌ ${err.message}`, 'error');
    }
}

/* =========================
   ROLLS - COMPÉTENCES
========================= */

/**
 * ✨ NOUVEAU: Lancer une compétence
 */
async function rollSkill(skillName, ability, bonus, isProficient) {
    try {
        // Utiliser la même route que les caractéristiques
        const response = await fetch(`http://localhost:3000/api/play/${characterId}/roll/ability`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                ability, 
                value: bonus 
            }),
        });

        if (!response.ok) {
            throw new Error('Erreur lors du jet de compétence');
        }

        const data = await response.json();

        const profText = isProficient ? ' (Maîtrise ★)' : '';
        showRollResult(
            `🎲 ${skillName}${profText} : 1d20 = ${data.roll} ${bonus >= 0 ? '+' : ''}${bonus} = ${data.roll + bonus}`,
            'success'
        );

        console.log('Skill roll result:', data);

    } catch (err) {
        console.error('Erreur jet de compétence:', err);
        showRollResult(`❌ ${err.message}`, 'error');
    }
}

/* =========================
   ROLLS - LIBRE
========================= */

async function rollFree(count, sides) {
    try {
        const response = await fetch('http://localhost:3000/api/play/roll', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                dice: `${count}d${sides}` 
            }),
        });

        if (!response.ok) {
            throw new Error('Erreur lors du lancer de dés');
        }

        const data = await response.json();

        showRollResult(
            `🎲 ${count}d${sides} = ${data.roll}`,
            'success'
        );

        console.log('Dice roll:', data);

    } catch (err) {
        console.error('Erreur lancer de dés:', err);
        showRollResult(`❌ ${err.message}`, 'error');
    }
}

/* =========================
   ROLL PERSONNALISÉ
========================= */

function rollCustom() {
    const count = parseInt(document.getElementById('dice-count').value);
    const sides = parseInt(document.getElementById('dice-sides').value);

    if (!count || count < 1 || count > 20) {
        showRollResult('❌ Nombre de dés invalide (1-20)', 'error');
        return;
    }

    if (!sides || ![4, 6, 8, 10, 12, 20, 100].includes(sides)) {
        showRollResult('❌ Type de dé invalide', 'error');
        return;
    }

    rollFree(count, sides);
}