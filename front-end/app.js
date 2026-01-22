// Application Character Builder D&D 5e

// État de l'application
const appState = {
    currentStep: 0,
    characterName: '',
    selectedRace: null,
    selectedClass: null,
    abilityScores: null,

    selectedBackground: null,

    // separation des compétences de background et de classe pour une meilleure gestion
    backgroundSkills: [],
    classSkills: [],

    // compétences finales (fusion des deux)
    selectedSkills: [],
};


const steps = ['Nom', 'Espèce', 'Classe', 'Caractéristiques', 'Historique', 'Compétences', 'Fiche'];

// Constantes pour Point Buy
const POINT_BUY_MAX = 27;
const MIN_SCORE = 8;
const MAX_SCORE = 15;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    render();
});

// Fonction principale de rendu
function render() {
    renderStepIndicator();
    renderMainContent();
    renderNavigationButtons();
}

// Rendu de l'indicateur d'étapes
function renderStepIndicator() {
    const container = document.getElementById('step-indicator');

    const stepsHTML = steps.map((step, index) => {
        const isCompleted = index < appState.currentStep;
        const isActive = index === appState.currentStep;
        const circleClass = isCompleted ? 'completed' : isActive ? 'active' : '';
        const labelClass = isCompleted || isActive ? 'active' : '';
        const connectorClass = isCompleted ? 'completed' : '';

        return `
            <div class="step-item">
                <div class="step-content">
                    <div class="step-circle ${circleClass}">
                        ${isCompleted ? '<svg class="icon"><use href="#icon-check"/></svg>' : index + 1}
                    </div>
                    <span class="step-label ${labelClass}">${step}</span>
                </div>
                ${index < steps.length - 1 ? `<div class="step-connector ${connectorClass}"></div>` : ''}
            </div>
        `;
    }).join('');

    container.innerHTML = `<div class="steps-container">${stepsHTML}</div>`;
}

// Rendu du contenu principal
function renderMainContent() {
    const container = document.getElementById('main-content');

    container.innerHTML = '';

    switch (appState.currentStep) {
        case 0:
            renderCharacterName(container);
            break;
        case 1:
            renderRaceSelection(container);
            break;
        case 2:
            renderClassSelection(container);
            break;
        case 3:
            renderAbilityScores(container);
            break;
        case 4:
            renderBackgroundSelection(container);
            break;
        case 5:
            renderSkillSelection(container);
            break;
        case 6:
            renderCharacterSheet(container);
            break;
    }
}


// Étape 0: Nom du personnage
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

// Étape 1: Sélection de l'espèce
function renderRaceSelection(container) {
    const racesHTML = races.map(race => {
        const isSelected = appState.selectedRace?.id === race.id;
        const bonusesHTML = Object.entries(race.abilityBonuses)
            .map(([ability, bonus]) => `<div>${abilityNames[ability]} +${bonus}</div>`)
            .join('');

        return `
            <div class="card selection-card card-clickable ${isSelected ? 'card-selected' : ''}" data-race-id="${race.id}">
                <h3 class="mb-2">${race.name}</h3>
                <p class="text-gray-600 mb-4 text-sm">${race.description}</p>
                
                <div class="space-y-2 text-sm">
                    <div>
                        <span class="font-semibold">Bonus de caractéristiques :</span>
                        <div class="text-gray-700 mt-1">${bonusesHTML}</div>
                    </div>
                    <div>
                        <span class="font-semibold">Vitesse :</span> ${race.speed} pieds
                    </div>
                    <div>
                        <span class="font-semibold">Langues :</span> ${race.languages.join(', ')}
                    </div>
                    <div>
                        <span class="font-semibold">Traits :</span>
                        <ul class="list-disc text-gray-700 mt-1">
                            ${race.traits.map(trait => `<li>${trait}</li>`).join('')}
                        </ul>
                    </div>
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
            appState.selectedRace = races.find(r => r.id === raceId);
            render();
        });
    });
}

// Étape 2: Sélection de la classe
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
        card.addEventListener('click', () => {
            const classId = Number(card.getAttribute('data-class-id'));
            appState.selectedClass = classes.find(c => c.id === classId);
            render();
        });
    });
}

// Étape 3: Caractéristiques (Point Buy)
function renderAbilityScores(container) {
    if (!appState.abilityScores) {
        appState.abilityScores = {
            strength: 8,
            dexterity: 8,
            constitution: 8,
            intelligence: 8,
            wisdom: 8,
            charisma: 8,
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
                        <button 
                            class="btn btn-outline btn-icon btn-sm" 
                            data-ability="${ability}" 
                            data-action="decrease"
                            ${!canDec ? 'disabled' : ''}
                        >
                            <svg class="icon"><use href="#icon-minus"/></svg>
                        </button>

                        <div class="ability-score-display">
                            <div class="score-value">${score}</div>
                            <div class="score-modifier">${modifier >= 0 ? '+' : ''}${modifier}</div>
                        </div>

                        <button 
                            class="btn btn-outline btn-icon btn-sm" 
                            data-ability="${ability}" 
                            data-action="increase"
                            ${!canInc ? 'disabled' : ''}
                        >
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
                        <p class="text-sm text-gray-600">
                            Les scores vont de 8 à 15. Chaque augmentation coûte plus cher.
                        </p>
                    </div>
                    <div class="text-right">
                        <span class="badge ${badgeClass} point-buy-badge">
                            ${pointsRemaining} / ${POINT_BUY_MAX}
                        </span>
                        <p class="text-xs text-gray-600 mt-1">Points restants</p>
                    </div>
                </div>
            </div>

            <div class="card p-6 mb-6">
                <div class="space-y-4">${abilitiesHTML}</div>
            </div>

            <div class="flex justify-between">
                <button class="btn btn-outline" id="btn-back-abilities">Retour</button>
                <button 
                    class="btn btn-primary btn-lg ml-auto" 
                    id="btn-confirm-abilities"
                    ${pointsRemaining < 0 ? 'disabled' : ''}
                >
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

// Étape 4: Sélection de l'historique
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

            // ✅ compétences automatiques du background
            appState.backgroundSkills = [...bg.skillProficiencies];

            // reset compétences de classe
            appState.classSkills = [];

            // rebuild compétences finales
            appState.selectedSkills = [...appState.backgroundSkills];

            render();
        });
    });

}


// Étape 5: Sélection des compétences
function renderSkillSelection(container) {
    console.log('selectedClass:', appState.selectedClass);

    if (!appState.selectedClass) {
        container.innerHTML = `
            <div class="card p-6 text-center">
                <p class="text-red-600 font-semibold">
                    Aucune classe sélectionnée.
                </p>
            </div>
        `;
        return;
    }

    const classSkills = appState.selectedClass.skills;
    const maxClassSkills = appState.selectedClass.skillChoices;
    const backgroundSkills = appState.backgroundSkills;

    const selectedClassSkillsCount = appState.classSkills.length;
    const canSelectMore = selectedClassSkillsCount < maxClassSkills;

    const badgeClass =
        selectedClassSkillsCount === maxClassSkills
            ? 'badge-primary'
            : 'badge-secondary';

    const skillsHTML = allSkills.map(skill => {
        const name = skill.name;
        const fromBackground = backgroundSkills.includes(name);
        const fromClass = appState.classSkills.includes(name);
        const isSelectable = classSkills.includes(name) && !fromBackground;

        let buttonClass = 'skill-button';
        if (fromBackground || fromClass) buttonClass += ' selected';
        if (fromBackground) buttonClass += ' from-background';

        return `
            <button
                class="${buttonClass}"
                data-skill="${name}"
                ${!isSelectable && !fromBackground ? 'disabled' : ''}
            >
                <div class="skill-content">
                    <div class="flex-1">
                        <div class="flex items-center gap-2">
                            <span class="font-semibold">${name}</span>
                            <span class="badge badge-outline text-xs">
                                ${abilityAbbrev[skill.ability]}
                            </span>
                        </div>
                        ${
                            fromBackground
                                ? '<span class="text-xs text-green-600 mt-1 block">Historique</span>'
                                : ''
                        }
                    </div>
                    ${(fromBackground || fromClass)
                        ? '<svg class="icon icon-lg text-blue-600"><use href="#icon-check"/></svg>'
                        : ''}
                </div>
            </button>
        `;
    }).join('');

    container.innerHTML = `
        <div class="max-w-4xl">
            <h2 class="mb-4 text-center">Sélectionnez vos compétences maîtrisées</h2>

            <div class="card p-6 mb-6">
                <p class="text-gray-600">
                    Votre classe <strong>${appState.selectedClass.name}</strong>
                    vous permet de choisir
                    <strong>${maxClassSkills} compétence${maxClassSkills > 1 ? 's' : ''}</strong>.
                </p>

                ${
                    backgroundSkills.length
                        ? `<p class="mt-2 text-gray-600">
                            Historique :
                            <strong>${backgroundSkills.join(', ')}</strong>
                          </p>`
                        : ''
                }

                <div class="flex items-center justify-between mt-4 p-4 bg-gray-50 rounded-lg">
                    <span class="font-semibold">Compétences de classe</span>
                    <span class="badge ${badgeClass} text-lg">
                        ${selectedClassSkillsCount} / ${maxClassSkills}
                    </span>
                </div>
            </div>

            <div class="card p-6">
                <div class="grid grid-cols-1 md-grid-cols-2 gap-4">
                    ${skillsHTML}
                </div>
            </div>
        </div>
    `;

    container.querySelectorAll('[data-skill]').forEach(btn => {
        btn.addEventListener('click', () => {
            const skill = btn.getAttribute('data-skill');

            // interdit de retirer une compétence de background
            if (backgroundSkills.includes(skill)) return;

            const index = appState.classSkills.indexOf(skill);

            if (index >= 0) {
                appState.classSkills.splice(index, 1);
            } else if (canSelectMore) {
                appState.classSkills.push(skill);
            }

            // 🔥 rebuild compétences finales
            appState.selectedSkills = [
                ...appState.backgroundSkills,
                ...appState.classSkills
            ];

            renderSkillSelection(container);
            renderNavigationButtons();
        });
    });
}


// Étape 6: Fiche de personnage
function renderCharacterSheet(container) {
    if (!appState.selectedRace || !appState.selectedClass || !appState.abilityScores || !appState.selectedBackground) {
        container.innerHTML = '<p>Données manquantes...</p>';
        return;
    }
    
    const race = appState.selectedRace;
    const cls = appState.selectedClass;
    const bg = appState.selectedBackground;
    const level = 1;
    
    // Appliquer les bonus raciaux
    const finalScores = { ...appState.abilityScores };
    Object.entries(race.abilityBonuses).forEach(([ability, bonus]) => {
        if (bonus) {
            finalScores[ability] += bonus;
        }
    });
    
    // Calculer les points de vie
    const constitutionMod = getAbilityModifier(finalScores.constitution);
    const maxHP = cls.hitDie + constitutionMod;
    const proficiencyBonus = 2;
    
    // Caractéristiques
    const abilitiesHTML = Object.keys(abilityNames).map(ability => {
        const score = finalScores[ability];
        const modifier = getAbilityModifier(score);
        const bonus = race.abilityBonuses[ability] || 0;
        
        return `
            <div class="ability-card">
                <div class="ability-card-abbr">${abilityAbbrev[ability]}</div>
                <div class="ability-card-score">${score}</div>
                <div class="badge badge-secondary">
                    ${modifier >= 0 ? '+' : ''}${modifier}
                </div>
                ${bonus > 0 ? `<div class="ability-card-bonus">+${bonus} racial</div>` : ''}
            </div>
        `;
    }).join('');
    
    // Jets de sauvegarde
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
    
    // Compétences maîtrisées
    const skillsHTML = allSkills
        .filter(skill => appState.selectedSkills.includes(skill.name))
        .map(skill => {
            const abilityScore = finalScores[skill.ability];
            const modifier = getAbilityModifier(abilityScore);
            const total = modifier + proficiencyBonus;
            
            return `
                <div class="skill-item">
                    <div class="skill-item-content">
                        <span class="badge badge-secondary text-xs">${abilityAbbrev[skill.ability]}</span>
                        <span>${skill.name}</span>
                    </div>
                    <span class="badge">${total >= 0 ? '+' : ''}${total}</span>
                </div>
            `;
        }).join('');
    
    container.innerHTML = `
        <div class="max-w-5xl">
            <h2 class="mb-6 text-center">Fiche de personnage</h2>
            
            <div class="card p-8">
                <!-- Informations de base -->
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
                        <p class="text-xl font-semibold">${race.name}</p>
                    </div>
                </div>
                
                <div class="mb-6">
                    <label class="stat-label">Historique</label>
                    <p class="text-lg font-semibold">${bg.name}</p>
                </div>
                
                <div class="separator"></div>
                
                <!-- Stats de combat -->
                <div class="character-sheet-grid cols-4 mb-6">
                    <div class="stat-box">
                        <label class="stat-label">Points de vie</label>
                        <p class="stat-value text-red-600">${maxHP}</p>
                    </div>
                    <div class="stat-box">
                        <label class="stat-label">Classe d'armure</label>
                        <p class="stat-value">10 + ${getAbilityModifier(finalScores.dexterity)}</p>
                    </div>
                    <div class="stat-box">
                        <label class="stat-label">Initiative</label>
                        <p class="stat-value">
                            ${getAbilityModifier(finalScores.dexterity) >= 0 ? '+' : ''}${getAbilityModifier(finalScores.dexterity)}
                        </p>
                    </div>
                    <div class="stat-box">
                        <label class="stat-label">Vitesse</label>
                        <p class="stat-value">${race.speed} pi</p>
                    </div>
                </div>
                
                <div class="separator"></div>
                
                <!-- Caractéristiques -->
                <div class="mb-6">
                    <h3 class="mb-4">Caractéristiques</h3>
                    <div class="grid grid-cols-2 md-grid-cols-3 lg-grid-cols-6 gap-4">
                        ${abilitiesHTML}
                    </div>
                </div>
                
                <div class="separator"></div>
                
                <!-- Jets de sauvegarde et maîtrises -->
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
                            <div>
                                <span class="font-semibold">Armures :</span>
                                <p class="text-gray-700">${cls.armorProficiencies.join(', ')}</p>
                            </div>
                            <div>
                                <span class="font-semibold">Armes :</span>
                                <p class="text-gray-700">${cls.weaponProficiencies.join(', ')}</p>
                            </div>
                            <div>
                                <span class="font-semibold">Langues :</span>
                                <p class="text-gray-700">${race.languages.join(', ')}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="separator"></div>
                
                <!-- Compétences maîtrisées -->
                <div class="mb-6">
                    <h3 class="mb-4">Compétences maîtrisées</h3>
                    <div class="grid grid-cols-1 md-grid-cols-2 gap-2">
                        ${skillsHTML}
                    </div>
                </div>
                
                <div class="separator"></div>
                
                <!-- Traits raciaux -->
                <div class="mb-6">
                    <h3 class="mb-4">Traits raciaux</h3>
                    <div class="grid grid-cols-1 md-grid-cols-2 gap-2">
                        ${race.traits.map(trait => `<span class="badge badge-outline">${trait}</span>`).join('')}
                    </div>
                </div>
                
                <div class="separator"></div>
                
                <!-- Détails de l'historique -->
                <div>
                    <h3 class="mb-4">Historique : ${bg.name}</h3>
                    <div class="space-y-2 text-sm">
                        <div>
                            <span class="font-semibold">Compétences :</span>
                            <p class="text-gray-700">${bg.skillProficiencies.join(', ')}</p>
                        </div>
                        <div>
                            <span class="font-semibold">Aptitude :</span>
                            <p class="text-gray-700">${bg.feature}</p>
                        </div>
                        <div>
                            <span class="font-semibold">Équipement :</span>
                            <ul class="list-disc text-gray-700">
                                ${bg.equipment.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Rendu des boutons de navigation
function renderNavigationButtons() {
    const container = document.getElementById('navigation-buttons');
    
    // Masquer les boutons pour l'étape des caractéristiques (elle a ses propres boutons)
    if (appState.currentStep === 3) {
        container.classList.add('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    
    const canNext = canGoNext();
    const isLastStep = appState.currentStep === steps.length - 1;
    
    container.innerHTML = `
        <button 
            class="btn btn-outline" 
            id="btn-previous"
            ${appState.currentStep === 0 ? 'disabled' : ''}
        >
            <svg class="icon"><use href="#icon-chevron-left"/></svg>
            Précédent
        </button>
        
        ${isLastStep ? `
            <div class="flex gap-4">
                <button class="btn btn-primary" id="btn-save">
                    Enregistrer le personnage
                </button>
                <button class="btn btn-outline" id="btn-export">
                    <svg class="icon"><use href="#icon-download"/></svg>
                    Exporter la fiche
                </button>
            </div>
        ` : `
            <button 
                class="btn btn-primary" 
                id="btn-next"
                ${!canNext ? 'disabled' : ''}
            >
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

// Navigation
function handleNext() {
    if (canGoNext() && appState.currentStep < steps.length - 1) {
        appState.currentStep++;
        render();
    }
}

function handlePrevious() {
    if (appState.currentStep > 0) {
        appState.currentStep--;
        render();
    }
}

function canGoNext() {
    switch (appState.currentStep) {
        case 0:
            return appState.characterName.trim().length > 0;
        case 1:
            return appState.selectedRace !== null;
        case 2:
            return appState.selectedClass !== null;
        case 3:
            return appState.abilityScores !== null;
        case 4:
            return appState.selectedBackground !== null;
        case 5:
            return appState.classSkills.length === appState.selectedClass.skillChoices;
        default:
            return false; // 🔥 IMPORTANT
    }
}





// Export
function handleExport() {
    if (!appState.selectedRace || !appState.selectedClass || !appState.abilityScores || !appState.selectedBackground) return;
    
    const character = {
        name: appState.characterName,
        race: appState.selectedRace.name,
        class: appState.selectedClass.name,
        background: appState.selectedBackground.name,
        level: 1,
        abilityScores: appState.abilityScores,
        skills: appState.selectedSkills,
    };
    
    const dataStr = JSON.stringify(character, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `${appState.characterName.replace(/\s+/g, '_')}_DnD5e.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Mapping Front → API
const abilityKeyMap = {
    strength: 'str',
    dexterity: 'dex',
    constitution: 'con',
    intelligence: 'int',
    wisdom: 'wis',
    charisma: 'cha',
};

// Convert abilities from UI format to API format
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


async function handleSave() {
    // Vérification des données du personnage
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

    const characterData = {
        name: appState.characterName,
        level: 1,
        classId: appState.selectedClass.id,
        speciesId: appState.selectedRace.id,
        backgroundId: appState.selectedBackground.id,
        abilities: apiAbilities
    };

    try {
        const btnSave = document.getElementById('btn-save');
        if (btnSave) {
            btnSave.disabled = true;
            btnSave.textContent = 'Enregistrement en cours...';
        }

        const API_URL = 'http://localhost:3000/api/characters';

        // ✅ Récupérer le token depuis localStorage
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Vous devez être connecté pour enregistrer un personnage.');
            return;
        }

        // ✅ Envoyer le token dans l'en-tête Authorization
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // <- très important
            },
            body: JSON.stringify(characterData)
        });

        // Gestion des erreurs
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de l’enregistrement');
        }

        const result = await response.json();
        alert(`Personnage enregistré avec succès ! ID: ${result.id}`);

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


// Fonctions utilitaires pour Point Buy
function calculatePointsUsed(scores) {
    return Object.values(scores).reduce((total, score) => {
        return total + (pointBuyCosts[score] || 0);
    }, 0);
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
