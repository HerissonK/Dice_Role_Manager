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
    }, 10000);
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
    
    // Compétences
    renderSkills(character);

    // Armes
    renderWeapons(character);
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
 * ✨ Afficher les compétences
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

/**
 * ⚔️ Afficher les armes avec boutons d'attaque
 */
function renderWeapons(character) {
    const weaponsDiv = document.getElementById('weapons');
    if (!weaponsDiv) return;

    weaponsDiv.innerHTML = '';

    // ✅ Accepte damage_dice (DB) OU damage (data.js)
    const weapons = (character.items || []).filter(item =>
        item.damage_dice || item.damage
    );

    if (weapons.length === 0) {
        weaponsDiv.innerHTML = '<p class="text-gray-600">Aucune arme équipée</p>';
        return;
    }

    weapons.forEach(weapon => {
        const abilities = character.abilities;
        const attackMod = getWeaponAttackMod(weapon, abilities);
        const proficiencyBonus = 2;
        const attackBonus = attackMod + proficiencyBonus;

        // ✅ Normaliser les champs (DB = damage_dice/damage_type, data.js = damage/damageType)
        const damageDice = weapon.damage_dice || weapon.damage || '?';
        const damageType = weapon.damage_type || weapon.damageType || '';

        const weaponCard = document.createElement('div');
        weaponCard.className = 'weapon-card';

        weaponCard.innerHTML = `
            <div class="weapon-card-header">
                <h4 class="weapon-name">⚔️ ${weapon.name}</h4>
                <span class="badge badge-outline">${damageType}</span>
            </div>
            <div class="weapon-stats">
                <div class="weapon-stat">
                    <span class="weapon-stat-label">Attaque</span>
                    <span class="weapon-stat-value">${attackBonus >= 0 ? '+' : ''}${attackBonus}</span>
                </div>
                <div class="weapon-stat">
                    <span class="weapon-stat-label">Dégâts</span>
                    <span class="weapon-stat-value">${damageDice} ${attackMod >= 0 ? '+' : ''}${attackMod}</span>
                </div>
            </div>
            <div class="weapon-actions">
                <button 
                    class="btn btn-primary btn-sm"
                    onclick="rollWeaponAttack(${weapon.id})"
                >
                    🎲 Attaque
                </button>
                <button 
                    class="btn btn-outline btn-sm"
                    onclick="rollWeaponDamage(${weapon.id}, false)"
                >
                    💥 Dégâts
                </button>
            </div>
        `;

        weaponsDiv.appendChild(weaponCard);
    });
}

/**
 * Calculer le modificateur d'attaque d'une arme
 */
function getWeaponAttackMod(weapon, abilities) {
    const strMod = abilityModifier(abilities.str);
    const dexMod = abilityModifier(abilities.dex);

    let properties = weapon.properties || [];
    if (typeof properties === 'string') {
        try { properties = JSON.parse(properties); } catch { properties = []; }
    }

    const hasRange   = properties.includes('range');
    const isThrown   = properties.includes('thrown');
    const hasFinesse = properties.includes('finesse');

    if (hasRange && !isThrown && !hasFinesse) return dexMod;  // Arc, Arbalète
    if (hasFinesse) return Math.max(strMod, dexMod);           // Rapière, Épée courte
    return strMod;                                              // Mêlée classique
}

/**
 * ⚔️ Jet d'attaque
 */
async function rollWeaponAttack(weaponId) {
    try {
        const response = await fetch(`http://localhost:3000/api/play/${characterId}/roll/attack`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ weaponId })
        });

        if (!response.ok) {
            throw new Error('Erreur lors du jet d\'attaque');
        }

        const data = await response.json();

        // Afficher le résultat
        let resultText = `⚔️ ${data.weaponName} - Attaque : 1d20 = ${data.d20}`;
        
        if (data.d20 === 20) {
            resultText += ' 🌟 CRITIQUE !';
        } else if (data.d20 === 1) {
            resultText += ' 💀 ÉCHEC CRITIQUE';
        }
        
        resultText += ` ${data.attackModifier + data.proficiencyBonus >= 0 ? '+' : ''}${data.attackModifier + data.proficiencyBonus} = ${data.total}`;

        showRollResult(resultText, data.isCritical ? 'success' : 'info');

        console.log('Attack roll:', data);

        // Si critique, proposer les dégâts
        if (data.isCritical) {
            setTimeout(() => {
                if (confirm('Coup critique ! Lancer les dégâts ?')) {
                    rollWeaponDamage(weaponId, true);
                }
            }, 1000);
        }

    } catch (err) {
        console.error('Erreur jet d\'attaque:', err);
        showRollResult(`❌ ${err.message}`, 'error');
    }
}

/**
 * 💥 Jet de dégâts
 */
async function rollWeaponDamage(weaponId, isCritical = false) {
    try {
        const response = await fetch(`http://localhost:3000/api/play/${characterId}/roll/damage`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ weaponId, isCritical })
        });

        if (!response.ok) {
            throw new Error('Erreur lors du jet de dégâts');
        }

        const data = await response.json();

        // Afficher le résultat
        let resultText = `💥 ${data.weaponName} - Dégâts${isCritical ? ' CRITIQUES' : ''} : `;
        resultText += `${data.dice} = [${data.rolls.join(', ')}]`;
        resultText += ` ${data.damageModifier >= 0 ? '+' : ''}${data.damageModifier} = ${data.total} ${data.damageType}`;

        showRollResult(resultText, isCritical ? 'warning' : 'success');

        console.log('Damage roll:', data);

    } catch (err) {
        console.error('Erreur jet de dégâts:', err);
        showRollResult(`❌ ${err.message}`, 'error');
    }
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


/* =========================
   📜 JOURNAL DES LANCERS
========================= */

const JOURNAL_KEY = `dnd_journal_${characterId || 'default'}`;
const JOURNAL_MAX = 100; // garder les 100 derniers lancers

/**
 * Charger le journal depuis localStorage
 */
function loadJournal() {
    try {
        const raw = localStorage.getItem(JOURNAL_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

/**
 * Sauvegarder le journal
 */
function saveJournal(entries) {
    try {
        // Garder seulement les N derniers
        const trimmed = entries.slice(-JOURNAL_MAX);
        localStorage.setItem(JOURNAL_KEY, JSON.stringify(trimmed));
    } catch (e) {
        console.warn('Journal: erreur localStorage', e);
    }
}

/**
 * Ajouter une entrée au journal
 * @param {Object} entry
 * @param {string} entry.type     - 'ability' | 'skill' | 'attack' | 'damage' | 'free' | 'critical'
 * @param {string} entry.label    - Nom affiché (ex: "Force", "Perception ★", "Épée longue")
 * @param {string} entry.dice     - Expression dés (ex: "1d20", "2d6")
 * @param {number} entry.d20      - Résultat brut du d20 (pour attack)
 * @param {number[]} entry.rolls  - Tous les dés lancés
 * @param {number} entry.mod      - Modificateur appliqué
 * @param {number} entry.total    - Résultat final
 * @param {string} [entry.detail] - Détail optionnel (ex: "tranchant", "CRITIQUE !")
 */
function addJournalEntry(entry) {
    const entries = loadJournal();

    const fullEntry = {
        ...entry,
        id: Date.now(),
        ts: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    entries.push(fullEntry);
    saveJournal(entries);
    renderJournal();
}

/**
 * Vider le journal
 */
function clearJournal() {
    if (!confirm('Effacer tout l\'historique des lancers ?')) return;
    localStorage.removeItem(JOURNAL_KEY);
    renderJournal();
}

/**
 * Obtenir l'emoji du dé selon le type
 */
function getDieBadgeText(entry) {
    if (entry.type === 'attack')   return 'd20';
    if (entry.type === 'critical') return 'NAT';
    if (entry.type === 'ability')  return 'd20';
    if (entry.type === 'skill')    return 'd20';
    if (entry.type === 'free')     return entry.dice || 'd?';
    if (entry.type === 'damage') {
        const dice = entry.dice || '';
        return dice.split('d')[1] ? `d${dice.split('d')[1]}` : 'd?';
    }
    return 'd20';
}

/**
 * Classe CSS pour le total selon la valeur
 */
function getTotalClass(entry) {
    if (entry.type === 'critical' || (entry.d20 === 20)) return 'critical';
    if (entry.d20 === 1) return 'low';
    if (entry.type === 'attack' || entry.type === 'ability' || entry.type === 'skill') {
        if (entry.total >= 18) return 'high';
        if (entry.total <= 5)  return 'low';
    }
    if (entry.type === 'damage') {
        if (entry.total >= 10) return 'high';
    }
    return '';
}

/**
 * Formater la ligne de résultat
 */
function formatResult(entry) {
    const sign = (n) => n >= 0 ? `+${n}` : `${n}`;

    if (entry.type === 'attack') {
        const crit = entry.d20 === 20 ? ' 🌟' : entry.d20 === 1 ? ' 💀' : '';
        return `1d20(${entry.d20})${crit} ${sign(entry.mod)} = <span class="roll-total ${getTotalClass(entry)}">${entry.total}</span>`;
    }

    if (entry.type === 'damage' || entry.type === 'critical') {
        const rollsStr = entry.rolls ? `[${entry.rolls.join('+')}]` : '';
        return `${entry.dice}${rollsStr} ${sign(entry.mod)} = <span class="roll-total ${getTotalClass(entry)}">${entry.total}</span>`;
    }

    if (entry.type === 'ability' || entry.type === 'skill') {
        return `1d20(${entry.d20}) ${sign(entry.mod)} = <span class="roll-total ${getTotalClass(entry)}">${entry.total}</span>`;
    }

    // free
    return `${entry.dice} = <span class="roll-total ${getTotalClass(entry)}">${entry.total}</span>`;
}

/**
 * Rendu complet du journal
 */
function renderJournal() {
    const entries = loadJournal();
    const list    = document.getElementById('journal-list');
    const empty   = document.getElementById('journal-empty');
    const counter = document.getElementById('journal-count');

    if (!list) return;

    // Compteur
    if (counter) counter.textContent = entries.length;

    // Vide
    if (entries.length === 0) {
        if (empty) empty.style.display = 'flex';
        list.innerHTML = '';
        return;
    }

    if (empty) empty.style.display = 'none';

    list.innerHTML = entries.map((entry, idx) => {
        const badgeText = getDieBadgeText(entry);
        const resultHtml = formatResult(entry);
        const detailHtml = entry.detail
            ? `<div class="journal-entry-detail">${entry.detail}</div>`
            : '';

        // Séparateur si premier de la liste (plus ancien)
        const isFirst = idx === 0;
        const sep = isFirst
            ? `<li class="journal-date-sep">— début de session —</li>`
            : '';

        return `
            ${sep}
            <li class="journal-entry" data-type="${entry.type}">
                <div class="journal-die-badge">${badgeText}</div>
                <div class="journal-entry-content">
                    <div class="journal-entry-label">${entry.label}</div>
                    <div class="journal-entry-result">${resultHtml}</div>
                    ${detailHtml}
                </div>
                <div class="journal-entry-time">${entry.ts}</div>
            </li>
        `;
    }).join('');
}

// ─────────────────────────────────────────────────────
// PATCH DES FONCTIONS EXISTANTES pour alimenter le journal
// ─────────────────────────────────────────────────────

/**
 * Remplacer rollAbility pour alimenter le journal
 */
async function rollAbility(ability, modifier, name) {
    try {
        const response = await fetch(`http://localhost:3000/api/play/${characterId}/roll/ability`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ ability, value: modifier }),
        });
        if (!response.ok) throw new Error('Erreur jet caractéristique');

        const data = await response.json();
        const total = data.roll + modifier;

        showRollResult(
            `🎲 ${name} : 1d20 = ${data.roll} ${modifier >= 0 ? '+' : ''}${modifier} = ${total}`,
            'success'
        );

        addJournalEntry({
            type:  'ability',
            label: name,
            dice:  '1d20',
            d20:   data.roll,
            mod:   modifier,
            total: total
        });

    } catch (err) {
        showRollResult(`❌ ${err.message}`, 'error');
    }
}

/**
 * Remplacer rollSkill pour alimenter le journal
 */
async function rollSkill(skillName, ability, bonus, isProficient) {
    try {
        const response = await fetch(`http://localhost:3000/api/play/${characterId}/roll/ability`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ ability, value: bonus }),
        });
        if (!response.ok) throw new Error('Erreur jet compétence');

        const data = await response.json();
        const total = data.roll + bonus;

        const profText = isProficient ? ' (Maîtrise ★)' : '';
        showRollResult(
            `🎲 ${skillName}${profText} : 1d20 = ${data.roll} ${bonus >= 0 ? '+' : ''}${bonus} = ${total}`,
            'success'
        );

        addJournalEntry({
            type:   'skill',
            label:  `${skillName}${isProficient ? ' ★' : ''}`,
            dice:   '1d20',
            d20:    data.roll,
            mod:    bonus,
            total:  total,
            detail: isProficient ? 'Compétence maîtrisée' : null
        });

    } catch (err) {
        showRollResult(`❌ ${err.message}`, 'error');
    }
}

/**
 * Remplacer rollWeaponAttack pour alimenter le journal
 */
async function rollWeaponAttack(weaponId) {
    try {
        const response = await fetch(`http://localhost:3000/api/play/${characterId}/roll/attack`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ weaponId })
        });
        if (!response.ok) throw new Error('Erreur jet d\'attaque');

        const data = await response.json();
        const totalMod = data.attackModifier + data.proficiencyBonus;

        let resultText = `⚔️ ${data.weaponName} — Attaque : 1d20 = ${data.d20}`;
        if (data.d20 === 20) resultText += ' 🌟 CRITIQUE !';
        else if (data.d20 === 1) resultText += ' 💀 ÉCHEC';
        resultText += ` ${totalMod >= 0 ? '+' : ''}${totalMod} = ${data.total}`;

        showRollResult(resultText, data.isCritical ? 'success' : 'info');

        addJournalEntry({
            type:   data.isCritical ? 'critical' : 'attack',
            label:  `${data.weaponName} — Attaque`,
            dice:   '1d20',
            d20:    data.d20,
            mod:    totalMod,
            total:  data.total,
            detail: data.isCritical ? '🌟 Coup critique !' : data.isFumble ? '💀 Échec critique' : null
        });

        if (data.isCritical) {
            setTimeout(() => {
                if (confirm('Coup critique ! Lancer les dégâts ?')) {
                    rollWeaponDamage(weaponId, true);
                }
            }, 800);
        }

    } catch (err) {
        showRollResult(`❌ ${err.message}`, 'error');
    }
}

/**
 * Remplacer rollWeaponDamage pour alimenter le journal
 */
async function rollWeaponDamage(weaponId, isCritical = false) {
    try {
        const response = await fetch(`http://localhost:3000/api/play/${characterId}/roll/damage`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ weaponId, isCritical })
        });
        if (!response.ok) throw new Error('Erreur jet de dégâts');

        const data = await response.json();

        let resultText = `💥 ${data.weaponName} — Dégâts${isCritical ? ' CRITIQUES' : ''} : `;
        resultText += `${data.dice}=[${data.rolls.join(', ')}] ${data.damageModifier >= 0 ? '+' : ''}${data.damageModifier} = ${data.total} ${data.damageType}`;

        showRollResult(resultText, isCritical ? 'warning' : 'success');

        addJournalEntry({
            type:   'damage',
            label:  `${data.weaponName} — Dégâts${isCritical ? ' critiques' : ''}`,
            dice:   data.dice,
            rolls:  data.rolls,
            mod:    data.damageModifier,
            total:  data.total,
            detail: `${data.damageType}${isCritical ? ' · Dés doublés 🌟' : ''}`
        });

    } catch (err) {
        showRollResult(`❌ ${err.message}`, 'error');
    }
}

/**
 * Remplacer rollFree pour alimenter le journal
 */
async function rollFree(count, sides) {
    try {
        const response = await fetch('http://localhost:3000/api/play/roll', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ dice: `${count}d${sides}` }),
        });
        if (!response.ok) throw new Error('Erreur lancer de dés');

        const data = await response.json();

        showRollResult(`🎲 ${count}d${sides} = ${data.roll}`, 'success');

        addJournalEntry({
            type:  'free',
            label: `Dé libre`,
            dice:  `${count}d${sides}`,
            d20:   data.roll,
            mod:   0,
            total: data.roll
        });

    } catch (err) {
        showRollResult(`❌ ${err.message}`, 'error');
    }
}

// ─────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────

// Charger le journal au démarrage
document.addEventListener('DOMContentLoaded', () => {
    // ... votre code d'init existant ...

    // Journal
    renderJournal();

    const clearBtn = document.getElementById('journal-clear');
    if (clearBtn) clearBtn.addEventListener('click', clearJournal);
});