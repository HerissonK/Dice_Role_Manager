console.log('🎲 Play page loaded');

/* =========================
   UTILS
========================= */

// Récupérer l'id depuis ?id=3
function getCharacterIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Modificateur D&D
function abilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

// Token JWT
function getAuthHeaders() {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token manquant – utilisateur non connecté');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

/* =========================
   INIT
========================= */

const characterId = getCharacterIdFromUrl();
const resultBox = document.getElementById('result');

console.log('Character ID:', characterId);

if (!characterId) {
  console.error('❌ Aucun characterId dans l’URL');
} else {
  loadCharacter();
}

/* =========================
   LOAD CHARACTER
========================= */

async function loadCharacter() {
  try {
    const response = await fetch(`/api/play/${characterId}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Erreur chargement personnage');
    }

    const character = await response.json();
    console.log('🎭 Character loaded:', character);

    renderCharacter(character);

  } catch (err) {
    console.error(err);
    resultBox.textContent = err.message;
  }
}

/* =========================
   RENDER
========================= */

function renderCharacter(character) {
  document.getElementById('charName').textContent = character.name;
  document.getElementById('charClass').textContent =
    `${character.species} ${character.class}`;
  document.getElementById('charPV').textContent = character.pv;
  document.getElementById('charAC').textContent = character.armorClass;

  const abilitiesDiv = document.getElementById('abilities');
  abilitiesDiv.innerHTML = '';

  Object.entries(character.abilities).forEach(([ability, value]) => {
    const mod = abilityModifier(value);

    const row = document.createElement('div');
    row.className = 'ability-row';

    const btn = document.createElement('button');
    btn.textContent = `${ability.toUpperCase()} (${value})`;
    btn.onclick = () => rollAbility(ability, mod);

    const modSpan = document.createElement('span');
    modSpan.textContent = ` mod ${mod >= 0 ? '+' : ''}${mod}`;

    row.appendChild(btn);
    row.appendChild(modSpan);

    abilitiesDiv.appendChild(row);
  });
}

/* =========================
   ROLLS
========================= */

async function rollAbility(ability, modifier) {
  try {
    const response = await fetch(`/api/play/${characterId}/roll/ability`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ability, value: modifier }),
    });

    if (!response.ok) {
      throw new Error('Erreur jet de caractéristique');
    }

    const data = await response.json();

    resultBox.textContent =
      `🎲 ${ability.toUpperCase()} : ${data.roll}`;

  } catch (err) {
    console.error(err);
    resultBox.textContent = err.message;
  }
}

async function rollFree(count, sides) {
  try {
    const response = await fetch(`/api/play/roll`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ dice: `${count}d${sides}` }),
    });

    const data = await response.json();

    resultBox.textContent =
      `🎲 ${count}d${sides} → ${data.roll}`;

  } catch (err) {
    console.error(err);
    resultBox.textContent = err.message;
  }
}
