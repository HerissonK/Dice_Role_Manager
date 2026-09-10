/**
 * Alert personnalisé
 * @param {string} message - Le message à afficher
 * @param {string} type - 'success', 'warning', 'danger', 'info'
 * @param {string} title - Titre du modal (optionnel)
 */

// Application Character Builder D&D 5e

const CLASS_API_BASE = 'http://localhost:3000/api';

const FIGHTING_STYLE_IDS = {
    ARCHERY: 1,
    DEFENSE: 2,
    DUELING: 3,
    TWO_WEAPON: 4,
    GREAT_WEAPON: 5,
    PROTECTION: 6
};

const appState = {
    currentStep: 0,
    characterName: '',
    selectedRace: null,
    selectedSubspecies: null,
    selectedClass: null,
    classSpellcasting: null,
    selectedCantrips: [],
    selectedSpells: [],
    classFightingStyle: null,
    selectedFightingStyle: null,
    classSpecialties: null,
    selectedFavoredEnemy: null,
    selectedFavoredTerrain: null,
    classExpertise: null,
    selectedExpertise: [],
    abilityScores: null,

    selectedBackground: null,

    backgroundSkills: [],
    classSkills: [],

    selectedSkills: [],
    selectedEquipment: {}
};

const steps = ['Nom', 'Espèce', 'Sous-espèce', 'Classe', 'Sorts', 'Style de combat', 'Spécialités', 'Caractéristiques', 'Historique', 'Compétences', 'Expertise', 'Équipement', 'Fiche'];

const POINT_BUY_MAX = 27;
const MIN_SCORE = 8;
const MAX_SCORE = 15;

document.addEventListener('DOMContentLoaded', () => {
    render();
});

function render() {
    renderStepIndicator();
    renderMainContent();
    renderNavigationButtons();
}

function renderStepIndicator() {
    const container = document.getElementById('step-indicator');

    const stepsHTML = steps.map((step, index) => {
        const isCompleted = index < appState.currentStep;
        const isActive = index === appState.currentStep;
        const circleClass = isCompleted ? 'completed' : isActive ? 'active' : '';
        const labelClass = isCompleted || isActive ? 'active' : '';

        return `
            <div class="step-item">
                <div class="step-content">
                    <div class="step-circle ${circleClass}">
                        ${isCompleted ? '✓' : index + 1}
                    </div>
                    <span class="step-label ${labelClass}">${step}</span>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `<div class="steps-container">${stepsHTML}</div>`;
}

function renderMainContent() {
    const container = document.getElementById('main-content');
    container.innerHTML = '';

    switch (appState.currentStep) {
        case 0: renderCharacterName(container); break;
        case 1: renderRaceSelection(container); break;
        case 2: renderSubspeciesSelection(container); break;
        case 3: renderClassSelection(container); break;
        case 4: renderSpellSelection(container); break;
        case 5: renderFightingStyleSelection(container); break;
        case 6: renderSpecialtiesSelection(container); break;
        case 7: renderAbilityScores(container); break;
        case 8: renderBackgroundSelection(container); break;
        case 9: renderSkillSelection(container); break;
        case 10: renderExpertiseSelection(container); break;
        case 11: renderEquipmentSelection(container); break;
        case 12: renderCharacterSheet(container); break;
    }
}

function renderCharacterName(container) {
    container.innerHTML = `
        <div class="max-w-2xl">
            <h2 class="mb-6 text-center">Nommez votre personnage</h2>
            <div class="card p-8">
                <div class="space-y-4">
                    <div>
                        <label class="label" for="character-name">Nom du personnage</label>
                        <input 
                            type="text" 
                            id="character-name" 
                            class="input input-lg" 
                            placeholder="Entrez le nom de votre personnage..."
                            value="${appState.characterName}"
                        />
                    </div>
                    <p class="text-sm text-gray-600">
                        Choisissez un nom qui reflète la personnalité et l'origine de votre personnage.
                        Vous pourrez toujours le modifier plus tard.
                    </p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('character-name').addEventListener('input', (e) => {
        appState.characterName = e.target.value;
        renderNavigationButtons();
    });
}

function renderRaceSelection(container) {
    const racesHTML = races.map(race => {
        const isSelected = appState.selectedRace?.id === race.id;
        const bonusesHTML = Object.entries(race.abilityBonuses)
            .map(([ability, bonus]) => `<div>${abilityNames[ability]} +${bonus}</div>`)
            .join('');
        const hasSubspecies = (race.subspecies || []).length > 0;

        return `
            <div class="card selection-card card-clickable ${isSelected ? 'card-selected' : ''}" data-race-id="${race.id}">
                <h3 class="mb-2">${race.name}</h3>
                <p class="text-gray-600 mb-4 text-sm">${race.description}</p>
                <div class="space-y-2 text-sm">
                    <div>
                        <span class="font-semibold">Bonus de caractéristiques :</span>
                        <div class="text-gray-700 mt-1">${bonusesHTML}</div>
                    </div>
                    <div><span class="font-semibold">Vitesse :</span> ${race.speed} pieds</div>
                    <div><span class="font-semibold">Langues :</span> ${race.languages.join(', ')}</div>
                    <div>
                        <span class="font-semibold">Traits :</span>
                        <ul class="list-disc text-gray-700 mt-1">
                            ${race.traits.map(trait => `<li>${trait}</li>`).join('')}
                        </ul>
                    </div>
                    ${hasSubspecies ? `<div class="text-xs text-blue-600 mt-2">${race.subspecies.length} sous-races disponibles</div>` : ''}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="max-w-6xl">
            <h2 class="mb-6 text-center">Choisissez votre espèce</h2>
            <div class="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3">${racesHTML}</div>
        </div>
    `;

    container.querySelectorAll('[data-race-id]').forEach(card => {
        card.addEventListener('click', () => {
            const raceId = Number(card.getAttribute('data-race-id'));
            const newRace = races.find(r => r.id === raceId);

            if (appState.selectedRace?.id !== newRace.id) {
                appState.selectedSubspecies = null;
            }

            appState.selectedRace = newRace;
            render();
        });
    });
}

function renderSubspeciesSelection(container) {
    const race = appState.selectedRace;
    const options = race?.subspecies || [];

    if (options.length === 0) {
        container.innerHTML = `
            <div class="card p-6 text-center">
                <p class="text-gray-600">Cette espèce n'a pas de sous-race officielle.</p>
            </div>
        `;
        return;
    }

    const optionsHTML = options.map(sub => {
        const isSelected = appState.selectedSubspecies?.id === sub.id;
        const bonusEntries = Object.entries(sub.abilityBonuses || {});
        const bonusesHTML = bonusEntries.length
            ? bonusEntries.map(([ability, bonus]) => `<div>${abilityNames[ability]} +${bonus}</div>`).join('')
            : '<div class="text-gray-500">Aucun bonus de caractéristique fixe</div>';

        return `
            <div class="card selection-card card-clickable ${isSelected ? 'card-selected' : ''}" data-subspecies-id="${sub.id}">
                <h3 class="mb-2">${sub.name}</h3>
                <p class="text-gray-600 mb-4 text-sm">${sub.description}</p>
                <div class="space-y-2 text-sm">
                    <div>
                        <span class="font-semibold">Bonus de caractéristiques :</span>
                        <div class="text-gray-700 mt-1">${bonusesHTML}</div>
                    </div>
                    ${sub.speedOverride ? `
                        <div><span class="font-semibold">Vitesse :</span> ${sub.speedOverride} pieds (au lieu de ${race.speed})</div>
                    ` : ''}
                    <div>
                        <span class="font-semibold">Traits :</span>
                        <ul class="list-disc text-gray-700 mt-1">
                            ${(sub.traits || []).map(trait => `<li>${trait}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="max-w-6xl">
            <h2 class="mb-6 text-center">Choisissez votre sous-espèce</h2>
            <p class="text-center text-gray-600 mb-6">${race.name} propose ${options.length} sous-races officielles.</p>
            <div class="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3">${optionsHTML}</div>
        </div>
    `;

    container.querySelectorAll('[data-subspecies-id]').forEach(card => {
        card.addEventListener('click', () => {
            const subId = Number(card.getAttribute('data-subspecies-id'));
            appState.selectedSubspecies = options.find(s => s.id === subId);
            render();
        });
    });
}

function renderClassSelection(container) {
    const classesHTML = classes.map(cls => {
        const isSelected = appState.selectedClass?.id === cls.id;
        const savingThrowsText = cls.savingThrows.map(ability => abilityNames[ability]).join(', ');

        return `
            <div class="card selection-card card-clickable ${isSelected ? 'card-selected' : ''}" data-class-id="${cls.id}">
                <h3 class="mb-2">${cls.name}</h3>
                <p class="text-gray-600 mb-4 text-sm">${cls.description}</p>
                <div class="space-y-2 text-sm">
                    <div class="flex items-center gap-2">
                        <span class="font-semibold">Dé de vie :</span>
                        <span class="badge badge-secondary">d${cls.hitDie}</span>
                    </div>
                    <div>
                        <span class="font-semibold">Caractéristique primaire :</span>
                        <div class="text-gray-700 mt-1">${abilityNames[cls.primaryAbility]}</div>
                    </div>
                    <div>
                        <span class="font-semibold">Jets de sauvegarde :</span>
                        <div class="text-gray-700 mt-1">${savingThrowsText}</div>
                    </div>
                    <div>
                        <span class="font-semibold">Maîtrises d'armure :</span>
                        <div class="text-gray-700 mt-1">${cls.armorProficiencies.join(', ')}</div>
                    </div>
                    <div>
                        <span class="font-semibold">Compétences :</span>
                        <div class="text-gray-700 mt-1">Choisir ${cls.skillChoices} parmi ${cls.skills.length}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="max-w-6xl">
            <h2 class="mb-6 text-center">Choisissez votre classe</h2>
            <div class="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3">${classesHTML}</div>
        </div>
    `;

    container.querySelectorAll('[data-class-id]').forEach(card => {
        card.addEventListener('click', async () => {
            const classId = Number(card.getAttribute('data-class-id'));
            appState.selectedClass = classes.find(c => c.id === classId);

            appState.selectedCantrips = [];
            appState.selectedSpells = [];
            appState.classSpellcasting = null;
            appState.selectedFightingStyle = null;
            appState.classFightingStyle = null;
            appState.selectedFavoredEnemy = null;
            appState.selectedFavoredTerrain = null;
            appState.classSpecialties = null;
            appState.selectedExpertise = [];
            appState.classExpertise = null;

            render();

            const [spellcasting, fightingStyle, specialties, expertise] = await Promise.all([
                fetchClassSpellcasting(classId),
                fetchClassFightingStyle(classId),
                fetchClassSpecialties(classId),
                fetchClassExpertise(classId)
            ]);
            appState.classSpellcasting = spellcasting;
            appState.classFightingStyle = fightingStyle;
            appState.classSpecialties = specialties;
            appState.classExpertise = expertise;
            render();
        });
    });
}

async function fetchClassSpellcasting(classId) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${CLASS_API_BASE}/classes/${classId}/starting-spells`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erreur lors du chargement des sorts de la classe');
        return await response.json();
    } catch (err) {
        console.error('Erreur fetchClassSpellcasting:', err);
        return { cantripsToChoose: 0, spellsToChoose: 0, eligibleCantrips: [], eligibleSpells: [] };
    }
}

async function fetchClassFightingStyle(classId) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${CLASS_API_BASE}/classes/${classId}/starting-fighting-style`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erreur lors du chargement du style de combat');
        return await response.json();
    } catch (err) {
        console.error('Erreur fetchClassFightingStyle:', err);
        return { hasChoice: false, options: [] };
    }
}

async function fetchClassSpecialties(classId) {
    const empty = { hasChoice: false, options: [] };
    try {
        const token = localStorage.getItem('authToken');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [enemyRes, terrainRes] = await Promise.all([
            fetch(`${CLASS_API_BASE}/classes/${classId}/starting-favored-enemy`, { headers }),
            fetch(`${CLASS_API_BASE}/classes/${classId}/starting-favored-terrain`, { headers })
        ]);

        if (!enemyRes.ok || !terrainRes.ok) throw new Error('Erreur lors du chargement des spécialités');

        const favoredEnemy = await enemyRes.json();
        const favoredTerrain = await terrainRes.json();

        return { favoredEnemy, favoredTerrain };
    } catch (err) {
        console.error('Erreur fetchClassSpecialties:', err);
        return { favoredEnemy: empty, favoredTerrain: empty };
    }
}

async function fetchClassExpertise(classId) {
    try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${CLASS_API_BASE}/classes/${classId}/starting-expertise`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Erreur lors du chargement de l\'expertise');
        return await response.json();
    } catch (err) {
        console.error('Erreur fetchClassExpertise:', err);
        return { hasChoice: false, count: 0 };
    }
}

function renderSpellSelection(container) {
    const sc = appState.classSpellcasting;

    if (!sc || (sc.cantripsToChoose + sc.spellsToChoose) === 0) {
        container.innerHTML = `
            <div class="card p-6 text-center">
                <p class="text-gray-600">Cette classe n'a aucun sort à choisir au niveau 1.</p>
            </div>
        `;
        return;
    }

    const cantripsHTML = sc.cantripsToChoose > 0 ? `
        <div class="card p-6 mb-6">
            <h3 class="mb-3">Tours de magie</h3>
            <p class="text-sm text-gray-600 mb-4">
                Choisissez ${sc.cantripsToChoose} tour${sc.cantripsToChoose > 1 ? 's' : ''} de magie
                (${appState.selectedCantrips.length} / ${sc.cantripsToChoose})
            </p>
            <div class="space-y-2">
                ${sc.eligibleCantrips.map(spell => `
                    <label class="flex items-center gap-2 p-2 cursor-pointer">
                        <input type="checkbox" data-spell-type="cantrip" value="${spell.id}"
                            ${appState.selectedCantrips.includes(spell.id) ? 'checked' : ''}>
                        <span>${spell.name}${spell.school ? ` <span class="text-xs text-gray-500">(${spell.school})</span>` : ''}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    ` : '';

    const spellsHTML = sc.spellsToChoose > 0 ? `
        <div class="card p-6 mb-6">
            <h3 class="mb-3">Sorts</h3>
            <p class="text-sm text-gray-600 mb-4">
                Choisissez ${sc.spellsToChoose} sort${sc.spellsToChoose > 1 ? 's' : ''}
                (${appState.selectedSpells.length} / ${sc.spellsToChoose})
            </p>
            <div class="space-y-2">
                ${sc.eligibleSpells.map(spell => `
                    <label class="flex items-center gap-2 p-2 cursor-pointer">
                        <input type="checkbox" data-spell-type="spell" value="${spell.id}"
                            ${appState.selectedSpells.includes(spell.id) ? 'checked' : ''}>
                        <span>${spell.name} <span class="text-xs text-gray-500">(niveau ${spell.level}${spell.school ? `, ${spell.school}` : ''})</span></span>
                    </label>
                `).join('')}
            </div>
        </div>
    ` : '';

    container.innerHTML = `
        <div class="max-w-3xl">
            <h2 class="mb-6 text-center">Choisissez vos sorts</h2>
            ${cantripsHTML}
            ${spellsHTML}
        </div>
    `;

    container.querySelectorAll('input[data-spell-type="cantrip"]').forEach(cb => {
        cb.addEventListener('change', () => {
            const id = Number(cb.value);
            if (cb.checked) {
                if (appState.selectedCantrips.length >= sc.cantripsToChoose) {
                    cb.checked = false;
                    return;
                }
                appState.selectedCantrips.push(id);
            } else {
                appState.selectedCantrips = appState.selectedCantrips.filter(x => x !== id);
            }
            renderSpellSelection(container);
            renderNavigationButtons();
        });
    });

    container.querySelectorAll('input[data-spell-type="spell"]').forEach(cb => {
        cb.addEventListener('change', () => {
            const id = Number(cb.value);
            if (cb.checked) {
                if (appState.selectedSpells.length >= sc.spellsToChoose) {
                    cb.checked = false;
                    return;
                }
                appState.selectedSpells.push(id);
            } else {
                appState.selectedSpells = appState.selectedSpells.filter(x => x !== id);
            }
            renderSpellSelection(container);
            renderNavigationButtons();
        });
    });
}

function renderFightingStyleSelection(container) {
    const fs = appState.classFightingStyle;

    if (!fs || !fs.hasChoice) {
        container.innerHTML = `
            <div class="card p-6 text-center">
                <p class="text-gray-600">Cette classe n'a pas de style de combat à choisir pour l'instant.</p>
            </div>
        `;
        return;
    }

    const optionsHTML = fs.options.map(style => {
        const isSelected = appState.selectedFightingStyle === style.id;
        return `
            <div class="card selection-card card-clickable ${isSelected ? 'card-selected' : ''}" data-style-id="${style.id}">
                <h3 class="mb-2">${style.name}</h3>
                <p class="text-gray-600 text-sm">${style.description}</p>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="max-w-5xl">
            <h2 class="mb-6 text-center">Choisissez votre style de combat</h2>
            <div class="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3">${optionsHTML}</div>
        </div>
    `;

    container.querySelectorAll('[data-style-id]').forEach(card => {
        card.addEventListener('click', () => {
            appState.selectedFightingStyle = Number(card.getAttribute('data-style-id'));
            render();
        });
    });
}

function renderSpecialtiesSelection(container) {
    const sp = appState.classSpecialties;

    if (!sp || (!sp.favoredEnemy.hasChoice && !sp.favoredTerrain.hasChoice)) {
        container.innerHTML = `
            <div class="card p-6 text-center">
                <p class="text-gray-600">Cette classe n'a pas de spécialité à choisir pour l'instant.</p>
            </div>
        `;
        return;
    }

    const enemyHTML = sp.favoredEnemy.hasChoice ? `
        <div class="card p-6 mb-6">
            <h3 class="mb-3">Ennemi juré</h3>
            <div class="grid grid-cols-2 md-grid-cols-3 gap-2">
                ${sp.favoredEnemy.options.map(opt => `
                    <label class="flex items-center gap-2 p-2 cursor-pointer">
                        <input type="radio" name="favored-enemy" value="${opt.id}"
                            ${appState.selectedFavoredEnemy === opt.id ? 'checked' : ''}>
                        <span>${opt.name}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    ` : '';

    const terrainHTML = sp.favoredTerrain.hasChoice ? `
        <div class="card p-6 mb-6">
            <h3 class="mb-3">Terrain de prédilection</h3>
            <div class="grid grid-cols-2 md-grid-cols-3 gap-2">
                ${sp.favoredTerrain.options.map(opt => `
                    <label class="flex items-center gap-2 p-2 cursor-pointer">
                        <input type="radio" name="favored-terrain" value="${opt.id}"
                            ${appState.selectedFavoredTerrain === opt.id ? 'checked' : ''}>
                        <span>${opt.name}</span>
                    </label>
                `).join('')}
            </div>
        </div>
    ` : '';

    container.innerHTML = `
        <div class="max-w-3xl">
            <h2 class="mb-6 text-center">Choisissez vos spécialités</h2>
            ${enemyHTML}
            ${terrainHTML}
        </div>
    `;

    container.querySelectorAll('input[name="favored-enemy"]').forEach(radio => {
        radio.addEventListener('change', () => {
            appState.selectedFavoredEnemy = Number(radio.value);
            renderNavigationButtons();
        });
    });

    container.querySelectorAll('input[name="favored-terrain"]').forEach(radio => {
        radio.addEventListener('change', () => {
            appState.selectedFavoredTerrain = Number(radio.value);
            renderNavigationButtons();
        });
    });
}

function renderAbilityScores(container) {
    if (!appState.abilityScores) {
        appState.abilityScores = {
            strength: 8, dexterity: 8, constitution: 8,
            intelligence: 8, wisdom: 8, charisma: 8,
        };
    }

    const scores = appState.abilityScores;
    const pointsUsed = calculatePointsUsed(scores);
    const pointsRemaining = POINT_BUY_MAX - pointsUsed;

    const badgeClass = pointsRemaining < 0 ? 'badge-destructive' : pointsRemaining === 0 ? 'badge-primary' : 'badge-secondary';

    const abilitiesHTML = Object.keys(abilityNames).map(ability => {
        const score = scores[ability];
        const modifier = getAbilityModifier(score);
        const canInc = canIncrease(ability, scores, pointsRemaining);
        const canDec = canDecrease(ability, scores);
        const costNext = score < MAX_SCORE ? pointBuyCosts[score + 1] - pointBuyCosts[score] : 0;

        let costInfoHTML = '';
        if (score < MAX_SCORE && canInc) {
            costInfoHTML = `<div class="cost-info">+1 = ${costNext}pt${costNext > 1 ? 's' : ''}</div>`;
        } else if (score < MAX_SCORE && !canInc && pointsRemaining < costNext) {
            costInfoHTML = `<div class="cost-info error">Besoin de ${costNext}pt${costNext > 1 ? 's' : ''}</div>`;
        } else if (score === MAX_SCORE) {
            costInfoHTML = `<div class="cost-info disabled">Maximum</div>`;
        }

        return `
            <div class="ability-score-item">
                <div class="flex items-center justify-between gap-4">
                    <div class="flex-1">
                        <div class="font-semibold text-lg">${abilityNames[ability]}</div>
                        <div class="text-sm text-gray-600">${abilityDescriptions[ability]}</div>
                    </div>
                    <div class="ability-controls">
                        <button class="btn btn-outline btn-icon btn-sm" data-ability="${ability}" data-action="decrease" ${!canDec ? 'disabled' : ''}>
                            <svg class="icon"><use href="#icon-minus"/></svg>
                        </button>
                        <div class="ability-score-display">
                            <div class="score-value">${score}</div>
                            <div class="score-modifier">${modifier >= 0 ? '+' : ''}${modifier}</div>
                        </div>
                        <button class="btn btn-outline btn-icon btn-sm" data-ability="${ability}" data-action="increase" ${!canInc ? 'disabled' : ''}>
                            <svg class="icon"><use href="#icon-plus"/></svg>
                        </button>
                    </div>
                    ${costInfoHTML}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="max-w-4xl">
            <h2 class="mb-4 text-center">Déterminez vos caractéristiques</h2>
            <p class="text-center text-gray-600 mb-6">
                Utilisez le système de points pour créer votre personnage. Vous disposez de <strong>27 points</strong> à répartir.
            </p>
            <div class="card p-6 mb-6">
                <div class="point-buy-info">
                    <div>
                        <h3 class="mb-1">Budget de points</h3>
                        <p class="text-sm text-gray-600">Les scores vont de 8 à 15. Chaque augmentation coûte plus cher.</p>
                    </div>
                    <div class="text-right">
                        <span class="badge ${badgeClass} point-buy-badge">${pointsRemaining} / ${POINT_BUY_MAX}</span>
                        <p class="text-xs text-gray-600 mt-1">Points restants</p>
                    </div>
                </div>
            </div>
            <div class="card p-6 mb-6">
                <div class="space-y-4">${abilitiesHTML}</div>
            </div>
            <div class="flex justify-between">
                <button class="btn btn-outline" id="btn-back-abilities">Retour</button>
                <button class="btn btn-primary btn-lg ml-auto" id="btn-confirm-abilities" ${pointsRemaining < 0 ? 'disabled' : ''}>
                    Confirmer les caractéristiques
                </button>
            </div>
        </div>
    `;

    container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', () => {
            const ability = btn.getAttribute('data-ability');
            const action = btn.getAttribute('data-action');
            if (action === 'increase') {
                appState.abilityScores[ability]++;
            } else {
                appState.abilityScores[ability]--;
            }
            renderAbilityScores(container);
        });
    });

    document.getElementById('btn-back-abilities').addEventListener('click', handlePrevious);
    document.getElementById('btn-confirm-abilities').addEventListener('click', () => {
        if (pointsRemaining >= 0) handleNext();
    });
}

function renderBackgroundSelection(container) {
    const backgroundsHTML = backgrounds.map(bg => {
        const isSelected = String(appState.selectedBackground?.id) === String(bg.id);
        return `
            <div class="card selection-card card-clickable ${isSelected ? 'card-selected' : ''}" data-bg-id="${bg.id}">
                <h3 class="mb-2">${bg.name}</h3>
                <p class="text-gray-600 mb-4 text-sm">${bg.description}</p>
                <div class="space-y-2 text-sm">
                    <div>
                        <span class="font-semibold">Maîtrise de compétences :</span>
                        <div class="text-gray-700 mt-1">${bg.skillProficiencies.join(', ')}</div>
                    </div>
                    ${bg.toolProficiencies.length > 0 ? `
                        <div>
                            <span class="font-semibold">Maîtrise d'outils :</span>
                            <div class="text-gray-700 mt-1">${bg.toolProficiencies.join(', ')}</div>
                        </div>
                    ` : ''}
                    ${bg.languages > 0 ? `
                        <div>
                            <span class="font-semibold">Langues :</span>
                            <div class="text-gray-700 mt-1">${bg.languages} au choix</div>
                        </div>
                    ` : ''}
                    <div>
                        <span class="font-semibold">Aptitude :</span>
                        <div class="text-gray-700 mt-1">${bg.feature}</div>
                    </div>
                    <div>
                        <span class="font-semibold">Équipement :</span>
                        <ul class="list-disc text-gray-700 mt-1">
                            ${bg.equipment.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="max-w-6xl">
            <h2 class="mb-6 text-center">Choisissez votre historique</h2>
            <div class="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3">${backgroundsHTML}</div>
        </div>
    `;

    container.querySelectorAll('[data-bg-id]').forEach(card => {
        card.addEventListener('click', () => {
            const bgId = Number(card.getAttribute('data-bg-id'));
            const bg = backgrounds.find(b => b.id === bgId);

            appState.selectedBackground = bg;
            appState.backgroundSkills = [...bg.skillProficiencies];
            appState.classSkills = [];
            appState.selectedSkills = [...appState.backgroundSkills];

            render();
        });
    });
}

function renderSkillSelection(container) {
    if (!appState.selectedClass) {
        container.innerHTML = `
            <div class="card p-6 text-center">
                <p class="text-red-600 font-semibold">Aucune classe sélectionnée.</p>
            </div>
        `;
        return;
    }

    const classSkills = appState.selectedClass.skills;
    const maxClassSkills = appState.selectedClass.skillChoices;
    const backgroundSkills = appState.backgroundSkills;

    const selectedClassSkillsCount = appState.classSkills.length;
    const canSelectMore = selectedClassSkillsCount < maxClassSkills;

    const badgeClass = selectedClassSkillsCount === maxClassSkills ? 'badge-primary' : 'badge-secondary';

    const skillsHTML = allSkills.map(skill => {
        const name = skill.name;
        const fromBackground = backgroundSkills.includes(name);
        const fromClass = appState.classSkills.includes(name);
        const isSelectable = classSkills.includes(name) && !fromBackground;

        let buttonClass = 'skill-button';
        if (fromBackground || fromClass) buttonClass += ' selected';
        if (fromBackground) buttonClass += ' from-background';

        return `
            <button class="${buttonClass}" data-skill="${name}" ${!isSelectable && !fromBackground ? 'disabled' : ''}>
                <div class="skill-content">
                    <div class="flex-1">
                        <div class="flex items-center gap-2">
                            <span class="font-semibold">${name}</span>
                            <span class="badge badge-outline text-xs">${abilityAbbrev[skill.ability]}</span>
                        </div>
                        ${fromBackground ? '<span class="text-xs text-green-600 mt-1 block">Historique</span>' : ''}
                    </div>
                    ${(fromBackground || fromClass) ? '<svg class="icon icon-lg text-blue-600"><use href="#icon-check"/></svg>' : ''}
                </div>
            </button>
        `;
    }).join('');

    container.innerHTML = `
        <div class="max-w-4xl">
            <h2 class="mb-4 text-center">Sélectionnez vos compétences maîtrisées</h2>
            <div class="card p-6 mb-6">
                <p class="text-gray-600">
                    Votre classe <strong>${appState.selectedClass.name}</strong> vous permet de choisir
                    <strong>${maxClassSkills} compétence${maxClassSkills > 1 ? 's' : ''}</strong>.
                </p>
                ${backgroundSkills.length ? `
                    <p class="mt-2 text-gray-600">Historique : <strong>${backgroundSkills.join(', ')}</strong></p>
                ` : ''}
                <div class="flex items-center justify-between mt-4 p-4 bg-gray-50 rounded-lg">
                    <span class="font-semibold">Compétences de classe</span>
                    <span class="badge ${badgeClass} text-lg">${selectedClassSkillsCount} / ${maxClassSkills}</span>
                </div>
            </div>
            <div class="card p-6">
                <div class="grid grid-cols-1 md-grid-cols-2 gap-4">${skillsHTML}</div>
            </div>
        </div>
    `;

    container.querySelectorAll('[data-skill]').forEach(btn => {
        btn.addEventListener('click', () => {
            const skill = btn.getAttribute('data-skill');
            if (backgroundSkills.includes(skill)) return;

            const index = appState.classSkills.indexOf(skill);
            if (index >= 0) {
                appState.classSkills.splice(index, 1);
            } else if (canSelectMore) {
                appState.classSkills.push(skill);
            }

            appState.selectedSkills = [...appState.backgroundSkills, ...appState.classSkills];

            appState.selectedExpertise = appState.selectedExpertise.filter(s => appState.selectedSkills.includes(s));

            renderSkillSelection(container);
            renderNavigationButtons();
        });
    });
}

function renderExpertiseSelection(container) {
    const ex = appState.classExpertise;

    if (!ex || !ex.hasChoice) {
        container.innerHTML = `
            <div class="card p-6 text-center">
                <p class="text-gray-600">Cette classe n'a pas d'expertise à choisir pour l'instant.</p>
            </div>
        `;
        return;
    }

    const availableSkills = appState.selectedSkills;

    container.innerHTML = `
        <div class="max-w-2xl">
            <h2 class="mb-4 text-center">Choisissez vos compétences d'expertise</h2>
            <p class="text-center text-gray-600 mb-6">
                Choisissez ${ex.count} compétences parmi celles déjà maîtrisées : leur bonus de maîtrise sera doublé.
                (${appState.selectedExpertise.length} / ${ex.count})
            </p>
            <div class="card p-6">
                <div class="space-y-2">
                    ${availableSkills.map(skill => `
                        <label class="flex items-center gap-2 p-2 cursor-pointer">
                            <input type="checkbox" data-expertise-skill value="${skill}"
                                ${appState.selectedExpertise.includes(skill) ? 'checked' : ''}>
                            <span>${skill}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    container.querySelectorAll('[data-expertise-skill]').forEach(cb => {
        cb.addEventListener('change', () => {
            const skill = cb.value;
            if (cb.checked) {
                if (appState.selectedExpertise.length >= ex.count) {
                    cb.checked = false;
                    return;
                }
                appState.selectedExpertise.push(skill);
            } else {
                appState.selectedExpertise = appState.selectedExpertise.filter(s => s !== skill);
            }
            renderExpertiseSelection(container);
            renderNavigationButtons();
        });
    });
}

function renderEquipmentSelection(container) {
    if (!appState.selectedClass) {
        container.innerHTML = `<div class="card p-6 text-center text-red-600">Aucune classe sélectionnée.</div>`;
        return;
    }

    const choices = appState.selectedClass.equipmentChoices || [];

    const choicesHTML = choices.map(choice => {
        const selectedOption = appState.selectedEquipment[choice.id];

        const optionsHTML = choice.options.map(option => {
            const isSelected = selectedOption === option.id;
            return `
                <button class="card selection-card card-clickable ${isSelected ? 'card-selected' : ''}" data-choice="${choice.id}" data-option="${option.id}">
                    <h4>${option.name}</h4>
                    <ul class="text-sm text-gray-700 mt-2">
                        ${option.items.map(i => `<li>${i}</li>`).join('')}
                    </ul>
                </button>
            `;
        }).join('');

        return `
            <div class="mb-6">
                <h3 class="mb-3">${choice.label}</h3>
                <div class="grid grid-cols-1 md-grid-cols-2 gap-4">${optionsHTML}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="max-w-4xl">
            <h2 class="mb-6 text-center">Choisissez votre équipement</h2>
            ${choicesHTML}
        </div>
    `;

    container.querySelectorAll('[data-choice]').forEach(btn => {
        btn.addEventListener('click', () => {
            const choiceId = btn.getAttribute('data-choice');
            const optionId = btn.getAttribute('data-option');
            appState.selectedEquipment[choiceId] = optionId;
            renderEquipmentSelection(container);
            renderNavigationButtons();
        });
    });
}

function computeArmorClass(dexModifier) {
    let baseArmor = null;
    let dexRule = 'full';
    let shieldBonus = 0;

    const choices = appState.selectedClass?.equipmentChoices || [];

    for (const choice of choices) {
        const optionId = appState.selectedEquipment[choice.id];
        const option = choice.options.find(o => o.id === optionId);
        if (!option || !option.itemsData) continue;

        for (const item of option.itemsData) {
            if (item.category?.startsWith('armor')) {
                baseArmor = item.armor_class;
                dexRule = item.dex_modifier_rule;
            }
            if (item.category === 'shield') {
                shieldBonus += item.armor_class || 2;
            }
        }
    }

    const defenseBonus = (baseArmor && appState.selectedFightingStyle === FIGHTING_STYLE_IDS.DEFENSE) ? 1 : 0;

    if (!baseArmor) {
        return 10 + dexModifier + shieldBonus;
    }

    let dexBonus = 0;
    if (dexRule === 'full') dexBonus = dexModifier;
    if (dexRule === 'max2') dexBonus = Math.min(dexModifier, 2);
    if (dexRule === 'none') dexBonus = 0;

    return baseArmor + dexBonus + shieldBonus + defenseBonus;
}

function getEquippedWeapons() {
    const weapons = [];
    const choices = appState.selectedClass.equipmentChoices || [];

    for (const choice of choices) {
        const optionId = appState.selectedEquipment[choice.id];
        const option = choice.options.find(o => o.id === optionId);
        if (!option?.itemsData) continue;

        for (const item of option.itemsData) {
            if (item.damage) weapons.push(item);
        }
    }

    return weapons;
}

function getAttackAbility(weapon, abilities) {
    const strMod = getAbilityModifier(abilities.strength);
    const dexMod = getAbilityModifier(abilities.dexterity);

    if (weapon.category?.includes('ranged')) return dexMod;
    if (weapon.properties?.includes('finesse')) return Math.max(strMod, dexMod);
    return strMod;
}

function getFightingStyleAttackBonus(weapon) {
    if (appState.selectedFightingStyle === FIGHTING_STYLE_IDS.ARCHERY && weapon.category?.includes('ranged')) {
        return 2;
    }
    return 0;
}

function getFightingStyleDamageBonus(weapon, allEquippedWeapons) {
    const isOneHandedMelee = !weapon.category?.includes('ranged') && !weapon.properties?.includes('two-handed');
    if (appState.selectedFightingStyle === FIGHTING_STYLE_IDS.DUELING && isOneHandedMelee && allEquippedWeapons.length === 1) {
        return 2;
    }
    return 0;
}

function renderCharacterSheet(container) {
    if (!appState.selectedRace || !appState.selectedClass || !appState.abilityScores || !appState.selectedBackground) {
        container.innerHTML = '<p>Données manquantes...</p>';
        return;
    }

    const race = appState.selectedRace;
    const subspecies = appState.selectedSubspecies;
    const cls = appState.selectedClass;
    const bg = appState.selectedBackground;
    const level = 1;

    const finalScores = { ...appState.abilityScores };
    Object.entries(race.abilityBonuses).forEach(([ability, bonus]) => {
        if (bonus) finalScores[ability] += bonus;
    });

    if (subspecies) {
        Object.entries(subspecies.abilityBonuses || {}).forEach(([ability, bonus]) => {
            if (bonus) finalScores[ability] += bonus;
        });
    }

    const effectiveSpeed = subspecies?.speedOverride || race.speed;

    const dexMod = getAbilityModifier(finalScores.dexterity);
    const armorClass = computeArmorClass(dexMod);

    const constitutionMod = getAbilityModifier(finalScores.constitution);
    const maxHP = cls.hitDie + constitutionMod;
    const proficiencyBonus = 2;

    const abilitiesHTML = Object.keys(abilityNames).map(ability => {
        const score = finalScores[ability];
        const modifier = getAbilityModifier(score);
        const raceBonus = race.abilityBonuses[ability] || 0;
        const subspeciesBonus = subspecies?.abilityBonuses?.[ability] || 0;
        const totalBonus = raceBonus + subspeciesBonus;

        return `
            <div class="ability-card">
                <div class="ability-card-abbr">${abilityAbbrev[ability]}</div>
                <div class="ability-card-score">${score}</div>
                <div class="badge badge-secondary">${modifier >= 0 ? '+' : ''}${modifier}</div>
                ${totalBonus > 0 ? `<div class="ability-card-bonus">+${totalBonus} racial</div>` : ''}
            </div>
        `;
    }).join('');

    const equippedWeapons = getEquippedWeapons();

    const weaponsHTML = equippedWeapons.map(w => {
        const abilityMod = getAttackAbility(w, finalScores);
        const styleAttackBonus = getFightingStyleAttackBonus(w);
        const attackBonus = abilityMod + proficiencyBonus + styleAttackBonus;

        const styleDamageBonus = getFightingStyleDamageBonus(w, equippedWeapons);
        const totalDamageMod = abilityMod + styleDamageBonus;

        return `
            <div class="weapon-card">
                <h4>${w.name}</h4>
                <p>Attaque : <strong>${attackBonus >= 0 ? '+' : ''}${attackBonus}</strong></p>
                <p>Dégâts : <strong>${w.damage}</strong> (${w.damageType}) ${totalDamageMod >= 0 ? '+' : ''}${totalDamageMod}</p>
            </div>
        `;
    }).join('');

    const savesHTML = Object.keys(abilityNames).map(ability => {
        const modifier = getAbilityModifier(finalScores[ability]);
        const isProficient = cls.savingThrows.includes(ability);
        const total = modifier + (isProficient ? proficiencyBonus : 0);

        return `
            <div class="save-item">
                <div class="save-item-content">
                    ${isProficient ? '<span class="badge badge-secondary text-xs">Maîtrise</span>' : ''}
                    <span>${abilityNames[ability]}</span>
                </div>
                <span class="badge">${total >= 0 ? '+' : ''}${total}</span>
            </div>
        `;
    }).join('');

    const skillsHTML = allSkills
        .filter(skill => appState.selectedSkills.includes(skill.name))
        .map(skill => {
            const abilityScore = finalScores[skill.ability];
            const modifier = getAbilityModifier(abilityScore);
            const isExpertise = appState.selectedExpertise.includes(skill.name);
            const total = modifier + proficiencyBonus * (isExpertise ? 2 : 1);

            return `
                <div class="skill-item">
                    <div class="skill-item-content">
                        <span class="badge badge-secondary text-xs">${abilityAbbrev[skill.ability]}</span>
                        <span>${skill.name}${isExpertise ? ' ⭐' : ''}</span>
                    </div>
                    <span class="badge">${total >= 0 ? '+' : ''}${total}</span>
                </div>
            `;
        }).join('');

    const allTraits = [...race.traits, ...(subspecies?.traits || [])];

    const sc = appState.classSpellcasting;
    const chosenCantrips = (sc?.eligibleCantrips || []).filter(spItem => appState.selectedCantrips.includes(spItem.id));
    const chosenSpells = (sc?.eligibleSpells || []).filter(spItem => appState.selectedSpells.includes(spItem.id));
    const hasSpells = chosenCantrips.length > 0 || chosenSpells.length > 0;

    const spellsSectionHTML = hasSpells ? `
        <div class="separator"></div>
        <div class="mb-6">
            <h3 class="mb-4">Sorts connus</h3>
            ${chosenCantrips.length > 0 ? `
                <div class="mb-3">
                    <span class="font-semibold">Tours de magie :</span>
                    <p class="text-gray-700">${chosenCantrips.map(spItem => spItem.name).join(', ')}</p>
                </div>
            ` : ''}
            ${chosenSpells.length > 0 ? `
                <div>
                    <span class="font-semibold">Sorts :</span>
                    <p class="text-gray-700">${chosenSpells.map(spItem => spItem.name).join(', ')}</p>
                </div>
            ` : ''}
        </div>
    ` : '';

    const fs = appState.classFightingStyle;
    const chosenStyle = (fs?.options || []).find(s => s.id === appState.selectedFightingStyle);

    const fightingStyleSectionHTML = chosenStyle ? `
        <div class="separator"></div>
        <div class="mb-6">
            <h3 class="mb-4">Style de combat</h3>
            <p class="text-gray-700"><strong>${chosenStyle.name}</strong> — ${chosenStyle.description}</p>
        </div>
    ` : '';

    const specialties = appState.classSpecialties;
    const chosenEnemy = (specialties?.favoredEnemy?.options || []).find(o => o.id === appState.selectedFavoredEnemy);
    const chosenTerrain = (specialties?.favoredTerrain?.options || []).find(o => o.id === appState.selectedFavoredTerrain);
    const hasSpecialties = chosenEnemy || chosenTerrain;

    const specialtiesSectionHTML = hasSpecialties ? `
        <div class="separator"></div>
        <div class="mb-6">
            <h3 class="mb-4">Spécialités</h3>
            ${chosenEnemy ? `<div class="mb-2"><span class="font-semibold">Ennemi juré :</span> <span class="text-gray-700">${chosenEnemy.name}</span></div>` : ''}
            ${chosenTerrain ? `<div><span class="font-semibold">Terrain de prédilection :</span> <span class="text-gray-700">${chosenTerrain.name}</span></div>` : ''}
        </div>
    ` : '';

    container.innerHTML = `
        <div class="max-w-5xl">
            <h2 class="mb-6 text-center">Fiche de personnage</h2>
            <div class="card p-8">
                <div class="character-sheet-grid cols-3 mb-6">
                    <div>
                        <label class="stat-label">Nom du personnage</label>
                        <p class="text-xl font-semibold">${appState.characterName || 'Sans nom'}</p>
                    </div>
                    <div>
                        <label class="stat-label">Classe & Niveau</label>
                        <p class="text-xl font-semibold">${cls.name} ${level}</p>
                    </div>
                    <div>
                        <label class="stat-label">Espèce</label>
                        <p class="text-xl font-semibold">${race.name}${subspecies ? ` — ${subspecies.name}` : ''}</p>
                    </div>
                </div>

                <div class="mb-6">
                    <label class="stat-label">Historique</label>
                    <p class="text-lg font-semibold">${bg.name}</p>
                </div>

                <div class="separator"></div>

                <div class="character-sheet-grid cols-4 mb-6">
                    <div class="stat-box">
                        <label class="stat-label">Points de vie</label>
                        <p class="stat-value text-red-600">${maxHP}</p>
                    </div>
                    <div class="stat-box">
                        <label class="stat-label">Classe d'armure</label>
                        <p class="stat-value">${armorClass}</p>
                    </div>
                    <div class="stat-box">
                        <label class="stat-label">Initiative</label>
                        <p class="stat-value">${getAbilityModifier(finalScores.dexterity) >= 0 ? '+' : ''}${getAbilityModifier(finalScores.dexterity)}</p>
                    </div>
                    <div class="stat-box">
                        <label class="stat-label">Vitesse</label>
                        <p class="stat-value">${effectiveSpeed} pi</p>
                    </div>
                </div>

                <div class="separator"></div>

                <div class="mb-6">
                    <h3 class="mb-4">Caractéristiques</h3>
                    <div class="grid grid-cols-2 md-grid-cols-3 lg-grid-cols-6 gap-4">${abilitiesHTML}</div>
                </div>

                <div class="separator"></div>

                <div class="character-sheet-grid cols-2 mb-6">
                    <div>
                        <h3 class="mb-4">Jets de sauvegarde</h3>
                        <div class="space-y-2">${savesHTML}</div>
                    </div>
                    <div>
                        <h3 class="mb-4">Bonus de maîtrise</h3>
                        <div class="text-center p-4 card mb-4">
                            <span class="text-3xl font-bold">+${proficiencyBonus}</span>
                        </div>
                        <h3 class="mb-4">Maîtrises</h3>
                        <div class="space-y-2 text-sm">
                            <div><span class="font-semibold">Armures :</span> <p class="text-gray-700">${cls.armorProficiencies.join(', ')}</p></div>
                            <div><span class="font-semibold">Armes :</span> <p class="text-gray-700">${cls.weaponProficiencies.join(', ')}</p></div>
                            <div><span class="font-semibold">Langues :</span> <p class="text-gray-700">${race.languages.join(', ')}</p></div>
                        </div>
                    </div>
                </div>
                <div class="separator"></div>

                <div class="mb-6">
                    <h3 class="mb-4">Armes</h3>
                    <div class="grid grid-cols-1 md-grid-cols-2 gap-4">${weaponsHTML || '<p>Aucune arme équipée</p>'}</div>
                </div>

                ${spellsSectionHTML}
                ${fightingStyleSectionHTML}
                ${specialtiesSectionHTML}

                <div class="separator"></div>

                <div class="mb-6">
                    <h3 class="mb-4">Compétences maîtrisées</h3>
                    ${appState.selectedExpertise.length > 0 ? '<p class="text-xs text-gray-500 mb-2">⭐ = Expertise (bonus doublé)</p>' : ''}
                    <div class="grid grid-cols-1 md-grid-cols-2 gap-2">${skillsHTML}</div>
                </div>

                <div class="separator"></div>

                <div class="mb-6">
                    <h3 class="mb-4">Traits raciaux</h3>
                    <div class="grid grid-cols-1 md-grid-cols-2 gap-2">
                        ${allTraits.map(trait => `<span class="badge badge-outline">${trait}</span>`).join('')}
                    </div>
                </div>

                <div class="separator"></div>

                <div>
                    <h3 class="mb-4">Historique : ${bg.name}</h3>
                    <div class="space-y-2 text-sm">
                        <div><span class="font-semibold">Compétences :</span> <p class="text-gray-700">${bg.skillProficiencies.join(', ')}</p></div>
                        <div><span class="font-semibold">Aptitude :</span> <p class="text-gray-700">${bg.feature}</p></div>
                        <div>
                            <span class="font-semibold">Équipement :</span>
                            <ul class="list-disc text-gray-700">${bg.equipment.map(item => `<li>${item}</li>`).join('')}</ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderNavigationButtons() {
    const container = document.getElementById('navigation-buttons');

    if (appState.currentStep === 7) {
        container.classList.add('hidden');
        return;
    }

    container.classList.remove('hidden');

    const canNext = canGoNext();
    const isLastStep = appState.currentStep === steps.length - 1;

    container.innerHTML = `
        <button class="btn btn-outline" id="btn-previous" ${appState.currentStep === 0 ? 'disabled' : ''}>
            <svg class="icon"><use href="#icon-chevron-left"/></svg>
            Précédent
        </button>
        ${isLastStep ? `
            <div class="flex gap-4">
                <button class="btn btn-primary" id="btn-save">Enregistrer le personnage</button>
                <button class="btn btn-outline" id="btn-export">
                    <svg class="icon"><use href="#icon-download"/></svg>
                    Exporter la fiche
                </button>
            </div>
        ` : `
            <button class="btn btn-primary" id="btn-next" ${!canNext ? 'disabled' : ''}>
                Suivant
                <svg class="icon"><use href="#icon-chevron-right"/></svg>
            </button>
        `}
    `;

    const btnPrev = document.getElementById('btn-previous');
    const btnNext = document.getElementById('btn-next');
    const btnExport = document.getElementById('btn-export');
    const btnSave = document.getElementById('btn-save');

    if (btnPrev) btnPrev.addEventListener('click', handlePrevious);
    if (btnNext) btnNext.addEventListener('click', handleNext);
    if (btnExport) btnExport.addEventListener('click', handleExport);
    if (btnSave) btnSave.addEventListener('click', handleSave);
}

function shouldSkipSpellStep() {
    const sc = appState.classSpellcasting;
    return !sc || (sc.cantripsToChoose + sc.spellsToChoose) === 0;
}

function shouldSkipFightingStyleStep() {
    const fs = appState.classFightingStyle;
    return !fs || !fs.hasChoice;
}

function shouldSkipSpecialtiesStep() {
    const sp = appState.classSpecialties;
    return !sp || (!sp.favoredEnemy.hasChoice && !sp.favoredTerrain.hasChoice);
}

function shouldSkipExpertiseStep() {
    const ex = appState.classExpertise;
    return !ex || !ex.hasChoice;
}

function handleNext() {
    if (!canGoNext() || appState.currentStep >= steps.length - 1) return;

    let nextStep = appState.currentStep + 1;

    if (nextStep === 2 && (appState.selectedRace?.subspecies?.length || 0) === 0) {
        appState.selectedSubspecies = null;
        nextStep = 3;
    }
    if (nextStep === 4 && shouldSkipSpellStep()) {
        nextStep = 5;
    }
    if (nextStep === 5 && shouldSkipFightingStyleStep()) {
        nextStep = 6;
    }
    if (nextStep === 6 && shouldSkipSpecialtiesStep()) {
        nextStep = 7;
    }
    if (nextStep === 10 && shouldSkipExpertiseStep()) {
        nextStep = 11;
    }

    appState.currentStep = nextStep;
    render();
}

function handlePrevious() {
    if (appState.currentStep <= 0) return;

    let prevStep = appState.currentStep - 1;

    if (prevStep === 10 && shouldSkipExpertiseStep()) {
        prevStep = 9;
    }
    if (prevStep === 6 && shouldSkipSpecialtiesStep()) {
        prevStep = 5;
    }
    if (prevStep === 5 && shouldSkipFightingStyleStep()) {
        prevStep = 4;
    }
    if (prevStep === 4 && shouldSkipSpellStep()) {
        prevStep = 3;
    }
    if (prevStep === 2 && (appState.selectedRace?.subspecies?.length || 0) === 0) {
        prevStep = 1;
    }

    appState.currentStep = prevStep;
    render();
}

function canGoNext() {
    switch (appState.currentStep) {
        case 0:
            return appState.characterName.trim().length > 0;
        case 1:
            return appState.selectedRace !== null;
        case 2: {
            const options = appState.selectedRace?.subspecies || [];
            if (options.length === 0) return true;
            return appState.selectedSubspecies !== null;
        }
        case 3:
            return appState.selectedClass !== null
                && appState.classSpellcasting !== null
                && appState.classFightingStyle !== null
                && appState.classSpecialties !== null
                && appState.classExpertise !== null;
        case 4: {
            const sc = appState.classSpellcasting;
            if (!sc) return true;
            const cantripsOk = appState.selectedCantrips.length === sc.cantripsToChoose;
            const spellsOk = appState.selectedSpells.length === sc.spellsToChoose;
            return cantripsOk && spellsOk;
        }
        case 5: {
            const fs = appState.classFightingStyle;
            if (!fs || !fs.hasChoice) return true;
            return appState.selectedFightingStyle !== null;
        }
        case 6: {
            const sp = appState.classSpecialties;
            if (!sp) return true;
            const enemyOk = !sp.favoredEnemy.hasChoice || appState.selectedFavoredEnemy !== null;
            const terrainOk = !sp.favoredTerrain.hasChoice || appState.selectedFavoredTerrain !== null;
            return enemyOk && terrainOk;
        }
        case 7:
            return appState.abilityScores !== null;
        case 8:
            return appState.selectedBackground !== null;
        case 9:
            return appState.classSkills.length === appState.selectedClass.skillChoices;
        case 10: {
            const ex = appState.classExpertise;
            if (!ex || !ex.hasChoice) return true;
            return appState.selectedExpertise.length === ex.count;
        }
        case 11:
            return Object.keys(appState.selectedEquipment).length ===
                   (appState.selectedClass.equipmentChoices?.length || 0);
        default:
            return false;
    }
}

function handleExport() {
    if (!appState.selectedRace || !appState.selectedClass || !appState.abilityScores || !appState.selectedBackground) return;

    const character = {
        name: appState.characterName,
        race: appState.selectedRace.name,
        subspecies: appState.selectedSubspecies?.name || null,
        class: appState.selectedClass.name,
        background: appState.selectedBackground.name,
        level: 1,
        abilityScores: appState.abilityScores,
        skills: appState.selectedSkills,
        cantrips: appState.selectedCantrips,
        spells: appState.selectedSpells,
        fightingStyleId: appState.selectedFightingStyle,
        favoredEnemyId: appState.selectedFavoredEnemy,
        favoredTerrainId: appState.selectedFavoredTerrain,
        expertiseSkills: appState.selectedExpertise,
    };

    const dataStr = JSON.stringify(character, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${appState.characterName.replace(/\s+/g, '_')}_DnD5e.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

const abilityKeyMap = {
    strength: 'str', dexterity: 'dex', constitution: 'con',
    intelligence: 'int', wisdom: 'wis', charisma: 'cha',
};

function buildApiAbilities(frontAbilities) {
    const apiAbilities = {};
    for (const [frontKey, apiKey] of Object.entries(abilityKeyMap)) {
        const value = frontAbilities[frontKey];
        if (typeof value !== 'number') {
            throw new Error(`Ability invalide: ${frontKey}`);
        }
        apiAbilities[apiKey] = value;
    }
    return apiAbilities;
}

function buildEquipmentItems() {
    const items = [];
    const choices = appState.selectedClass?.equipmentChoices || [];

    for (const choice of choices) {
        const optionId = appState.selectedEquipment[choice.id];
        const option = choice.options.find(o => o.id === optionId);
        if (!option) continue;

        if (option.itemsData && option.itemsData.length > 0) {
            items.push(...option.itemsData);
        } else if (option.items) {
            items.push(...option.items.map(name => ({ name })));
        }
    }

    return items;
}

async function handleSave() {
    if (!appState.selectedRace || !appState.selectedClass || !appState.abilityScores || !appState.selectedBackground) {
        alert('Données du personnage incomplètes');
        return;
    }

    let apiAbilities;
    try {
        apiAbilities = buildApiAbilities(appState.abilityScores);
    } catch (err) {
        alert(err.message);
        return;
    }

    const knownSpells = [...appState.selectedCantrips, ...appState.selectedSpells];

    const characterData = {
        name: appState.characterName,
        level: 1,
        classId: appState.selectedClass.id,
        speciesId: appState.selectedRace.id,
        subspeciesId: appState.selectedSubspecies ? appState.selectedSubspecies.id : null,
        backgroundId: appState.selectedBackground.id,
        abilities: apiAbilities,
        skills: appState.selectedSkills,
        equipment: buildEquipmentItems(),
        knownSpells,
        fightingStyleId: appState.selectedFightingStyle,
        favoredEnemyId: appState.selectedFavoredEnemy,
        favoredTerrainId: appState.selectedFavoredTerrain,
        expertiseSkills: appState.selectedExpertise
    };

    try {
        const btnSave = document.getElementById('btn-save');
        if (btnSave) {
            btnSave.disabled = true;
            btnSave.textContent = 'Enregistrement en cours...';
        }

        const API_URL = 'http://localhost:3000/api/characters';
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Vous devez être connecté pour enregistrer un personnage.');
            return;
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(characterData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de l’enregistrement');
        }

        const result = await response.json();

        const goToCharacters = await customConfirm(
            `Personnage "${appState.characterName}" créé avec succès !\n\nVoulez-vous aller voir vos personnages ?`,
            { title: 'Création réussie !', confirmText: 'Voir mes personnages', cancelText: 'Créer un autre', type: 'success' }
        );

        if (goToCharacters) {
            window.location.href = '/front-end/player/my-characters.html';
        } else {
            const restart = await customConfirm(
                'Voulez-vous créer un nouveau personnage ?',
                { title: 'Nouveau personnage', confirmText: 'Oui', cancelText: 'Non', type: 'question' }
            );
            if (restart) window.location.reload();
        }

    } catch (error) {
        console.error('Erreur handleSave:', error);
        alert(`Erreur: ${error.message}`);
    } finally {
        const btnSave = document.getElementById('btn-save');
        if (btnSave) {
            btnSave.disabled = false;
            btnSave.textContent = 'Enregistrer le personnage';
        }
    }
}

function calculatePointsUsed(scores) {
    return Object.values(scores).reduce((total, score) => total + (pointBuyCosts[score] || 0), 0);
}

function canIncrease(ability, scores, pointsRemaining) {
    const currentScore = scores[ability];
    if (currentScore >= MAX_SCORE) return false;
    const nextScore = currentScore + 1;
    const costDiff = pointBuyCosts[nextScore] - pointBuyCosts[currentScore];
    return pointsRemaining >= costDiff;
}

function canDecrease(ability, scores) {
    return scores[ability] > MIN_SCORE;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculatePointsUsed, canIncrease, canDecrease, MIN_SCORE, MAX_SCORE };
}