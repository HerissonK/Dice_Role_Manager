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

/**
 * Bonus de maîtrise D&D 5e à partir du niveau (même formule que
 * src/utils/proficiency.util.js côté serveur — dupliquée ici car c'est un
 * simple affichage indicatif sur la carte, jamais utilisé pour un calcul
 * qui compte réellement : les vrais jets utilisent la valeur renvoyée par
 * l'API, calculée côté serveur).
 */
function getProficiencyBonusDisplay(level) {
    return Math.floor((level - 1) / 4) + 2;
}

const ABILITY_LABELS = {
    str: 'Force', dex: 'Dextérité', con: 'Constitution',
    int: 'Intelligence', wis: 'Sagesse', cha: 'Charisme'
};


document.addEventListener('DOMContentLoaded', () => {
    if (!requireAuth()) {
        return;
    }

    loadCharacters();

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
 * Petit sélecteur de niveau de jeu, construit dynamiquement.
 * Résout avec le niveau choisi (Number), ou null si annulé.
 */
function showLevelSelectModal(maxLevel) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.style.cssText =
            'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;' +
            'align-items:center;justify-content:center;z-index:1000;';

        const box = document.createElement('div');
        box.style.cssText =
            'background:#1e2a1f;border:1px solid #d4af37;border-radius:8px;' +
            'padding:24px;min-width:280px;max-width:90vw;text-align:center;' +
            'color:#f0e8d0;font-family:inherit;';

        const title = document.createElement('h3');
        title.textContent = 'À quel niveau voulez-vous jouer ?';
        title.style.cssText = 'margin-bottom:16px;';

        const select = document.createElement('select');
        select.style.cssText =
            'width:100%;padding:8px;margin-bottom:16px;background:#233524;' +
            'color:#f0e8d0;border:1px solid #d4af37;border-radius:4px;';

        const safeMaxLevel = Math.max(1, maxLevel || 1);
        for (let lvl = 1; lvl <= safeMaxLevel; lvl++) {
            const opt = document.createElement('option');
            opt.value = lvl;
            opt.textContent = `Niveau ${lvl}${lvl === safeMaxLevel ? ' (maximum atteint)' : ''}`;
            if (lvl === safeMaxLevel) opt.selected = true;
            select.appendChild(opt);
        }

        const btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:8px;justify-content:center;';

        const btnCancel = document.createElement('button');
        btnCancel.textContent = 'Annuler';
        btnCancel.className = 'btn btn-outline btn-sm';
        btnCancel.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(null);
        });

        const btnConfirm = document.createElement('button');
        btnConfirm.textContent = 'Jouer à ce niveau';
        btnConfirm.className = 'btn btn-primary btn-sm';
        btnConfirm.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(Number(select.value));
        });

        btnRow.appendChild(btnCancel);
        btnRow.appendChild(btnConfirm);
        box.appendChild(title);
        box.appendChild(select);
        box.appendChild(btnRow);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    });
}

/**
 * Rediriger vers la page de jeu, après avoir demandé à quel niveau jouer.
 */
async function playCharacter(id, maxLevel) {
    console.log('🎲 playCharacter appelé avec id:', id, 'niveau max:', maxLevel);

    if (!id) {
        console.error('❌ ID manquant!');
        alert('Erreur: ID du personnage manquant');
        return;
    }

    const chosenLevel = await showLevelSelectModal(maxLevel);
    if (chosenLevel === null) return;

    const url = `play?id=${id}&level=${chosenLevel}`;
    console.log('🔗 Redirection vers:', url);
    window.location.href = url;
}

// =====================================================
// 🆙 MONTÉE DE NIVEAU
// =====================================================

async function startLevelUp(characterId) {
    try {
        const response = await authenticatedFetch(
            `${API_BASE_URL}/characters/${characterId}/level-up-preview`
        );

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Erreur lors du calcul de la montée de niveau');
        }

        const preview = await response.json();
        showLevelUpModal(characterId, preview);

    } catch (err) {
        await customAlert(err.message, 'danger', 'Montée de niveau impossible');
    }
}

function showLevelUpModal(characterId, preview) {
    const overlay = document.createElement('div');
    overlay.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;' +
        'align-items:center;justify-content:center;z-index:1000;padding:20px;';

    const box = document.createElement('div');
    box.style.cssText =
        'background:#1e2a1f;border:1px solid #d4af37;border-radius:8px;' +
        'padding:24px;width:480px;max-width:100%;max-height:85vh;overflow-y:auto;' +
        'color:#f0e8d0;font-family:inherit;';

    const title = document.createElement('h3');
    title.textContent = `Passage au niveau ${preview.nextLevel}`;
    title.style.cssText = 'margin-bottom:6px;color:#d4af37;';
    box.appendChild(title);

    // ---- Résumé : PV, bonus de maîtrise, emplacements de sorts ----
    const summarySection = document.createElement('div');
    summarySection.style.cssText = 'margin-bottom:18px;background:#233524;border-radius:6px;padding:14px;font-size:13px;';

    const pvLine = document.createElement('div');
    pvLine.style.cssText = 'margin-bottom:6px;';
    pvLine.innerHTML = `<strong style="color:#d4af37;">Points de vie :</strong> ${preview.currentPv} → ${preview.nextPv} <span style="color:#8a9a7f;">(+${preview.hpGain})</span>`;
    summarySection.appendChild(pvLine);

    const profLine = document.createElement('div');
    profLine.style.cssText = 'margin-bottom:6px;';
    if (preview.proficiencyBonusIncreases) {
        profLine.innerHTML = `<strong style="color:#d4af37;">Bonus de maîtrise :</strong> +${preview.currentProficiencyBonus} → +${preview.nextProficiencyBonus} <span style="color:#8a9a7f;">(augmente !)</span>`;
    } else {
        profLine.innerHTML = `<strong style="color:#d4af37;">Bonus de maîtrise :</strong> +${preview.nextProficiencyBonus} <span style="color:#8a9a7f;">(inchangé)</span>`;
    }
    summarySection.appendChild(profLine);

    const slotLevels = Object.keys(preview.spellSlotChanges || {});
    if (slotLevels.length > 0) {
        const slotsTitle = document.createElement('div');
        slotsTitle.style.cssText = 'margin-top:8px;margin-bottom:4px;color:#d4af37;font-weight:600;';
        slotsTitle.textContent = 'Emplacements de sorts :';
        summarySection.appendChild(slotsTitle);

        slotLevels
            .sort((a, b) => Number(a) - Number(b))
            .forEach(spellLevel => {
                const change = preview.spellSlotChanges[spellLevel];
                const line = document.createElement('div');
                line.style.cssText = 'color:#c8c2a8;';
                line.textContent = `Niveau ${spellLevel} : ${change.before} → ${change.after} (+${change.gained})`;
                summarySection.appendChild(line);
            });
    }

    box.appendChild(summarySection);

    if (preview.newFeatures.length > 0) {
        const featSection = document.createElement('div');
        featSection.style.cssText = 'margin-bottom:18px;';
        const featTitle = document.createElement('div');
        featTitle.textContent = 'Nouvelles capacités';
        featTitle.style.cssText = 'font-weight:600;margin-bottom:8px;';
        featSection.appendChild(featTitle);

        preview.newFeatures.forEach(f => {
            const item = document.createElement('div');
            item.style.cssText = 'background:#233524;border-radius:6px;padding:10px;margin-bottom:6px;font-size:13px;';
            item.innerHTML = `<strong style="color:#d4af37;">${f.name}</strong><br><span style="color:#c8c2a8;">${f.description || ''}</span>`;
            featSection.appendChild(item);
        });
        box.appendChild(featSection);
    }

    let getAbilityChoice = () => null;

    if (preview.requiresAbilityScoreImprovement) {
        const asiSection = document.createElement('div');
        asiSection.style.cssText = 'margin-bottom:18px;background:#233524;border-radius:6px;padding:14px;';

        const asiTitle = document.createElement('div');
        asiTitle.textContent = 'Amélioration de caractéristiques (obligatoire)';
        asiTitle.style.cssText = 'font-weight:600;margin-bottom:10px;';
        asiSection.appendChild(asiTitle);

        const modeRow = document.createElement('div');
        modeRow.style.cssText = 'display:flex;gap:8px;margin-bottom:10px;';

        let mode = 'single';

        const btnSingle = document.createElement('button');
        btnSingle.type = 'button';
        btnSingle.textContent = '+2 dans une caractéristique';
        const btnDouble = document.createElement('button');
        btnDouble.type = 'button';
        btnDouble.textContent = '+1 dans deux caractéristiques';

        [btnSingle, btnDouble].forEach(btn => {
            btn.style.cssText =
                'flex:1;padding:8px;font-size:12px;border-radius:4px;cursor:pointer;' +
                'background:transparent;color:#d4af37;border:1px solid #d4af37;';
        });
        modeRow.appendChild(btnSingle);
        modeRow.appendChild(btnDouble);
        asiSection.appendChild(modeRow);

        const singleWrap = document.createElement('div');
        const select1 = document.createElement('select');
        select1.style.cssText = 'width:100%;padding:6px;background:#1e2a1f;color:#f0e8d0;border:1px solid #3a4a3c;border-radius:4px;';
        Object.entries(ABILITY_LABELS).forEach(([key, label]) => {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = `${label} (+2)`;
            select1.appendChild(opt);
        });
        singleWrap.appendChild(select1);

        const doubleWrap = document.createElement('div');
        const selectA = document.createElement('select');
        const selectB = document.createElement('select');
        [selectA, selectB].forEach((sel, idx) => {
            sel.style.cssText = 'flex:1;padding:6px;background:#1e2a1f;color:#f0e8d0;border:1px solid #3a4a3c;border-radius:4px;';
            Object.entries(ABILITY_LABELS).forEach(([key, label]) => {
                const opt = document.createElement('option');
                opt.value = key;
                opt.textContent = `${label} (+1)`;
                if (idx === 1 && key === Object.keys(ABILITY_LABELS)[1]) opt.selected = true;
                sel.appendChild(opt);
            });
        });
        const doubleRow = document.createElement('div');
        doubleRow.style.cssText = 'display:flex;gap:8px;';
        doubleRow.appendChild(selectA);
        doubleRow.appendChild(selectB);
        doubleWrap.appendChild(doubleRow);
        doubleWrap.style.display = 'none';

        asiSection.appendChild(singleWrap);
        asiSection.appendChild(doubleWrap);

        function refreshModeUI() {
            singleWrap.style.display = mode === 'single' ? 'block' : 'none';
            doubleWrap.style.display = mode === 'double' ? 'block' : 'none';
            btnSingle.style.background = mode === 'single' ? '#d4af37' : 'transparent';
            btnSingle.style.color = mode === 'single' ? '#1e2a1f' : '#d4af37';
            btnDouble.style.background = mode === 'double' ? '#d4af37' : 'transparent';
            btnDouble.style.color = mode === 'double' ? '#1e2a1f' : '#d4af37';
        }
        btnSingle.addEventListener('click', () => { mode = 'single'; refreshModeUI(); });
        btnDouble.addEventListener('click', () => { mode = 'double'; refreshModeUI(); });
        refreshModeUI();

        getAbilityChoice = () => {
            if (mode === 'single') {
                return { ability1: select1.value, amount1: 2 };
            }
            if (selectA.value === selectB.value) {
                return { error: 'Les deux caractéristiques doivent être différentes' };
            }
            return { ability1: selectA.value, amount1: 1, ability2: selectB.value, amount2: 1 };
        };

        box.appendChild(asiSection);
    }

    let getCantripChoices = () => [];
    if (preview.newCantripsCount > 0) {
        const { section, getChoices } = buildSpellPicker(
            `Choisissez ${preview.newCantripsCount} nouveau${preview.newCantripsCount > 1 ? 'x' : ''} tour${preview.newCantripsCount > 1 ? 's' : ''} de magie`,
            preview.eligibleCantrips,
            preview.newCantripsCount
        );
        getCantripChoices = getChoices;
        box.appendChild(section);
    }

    let getSpellChoices = () => [];
    if (preview.newSpellsKnownCount > 0) {
        const { section, getChoices } = buildSpellPicker(
            `Choisissez ${preview.newSpellsKnownCount} nouveau${preview.newSpellsKnownCount > 1 ? 'x' : ''} sort${preview.newSpellsKnownCount > 1 ? 's' : ''}`,
            preview.eligibleSpells,
            preview.newSpellsKnownCount
        );
        getSpellChoices = getChoices;
        box.appendChild(section);
    }

    const btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:8px;margin-top:20px;';

    const btnCancel = document.createElement('button');
    btnCancel.textContent = 'Annuler';
    btnCancel.className = 'btn btn-outline btn-sm';
    btnCancel.style.flex = '1';
    btnCancel.addEventListener('click', () => document.body.removeChild(overlay));

    const btnConfirm = document.createElement('button');
    btnConfirm.textContent = 'Valider la montée de niveau';
    btnConfirm.className = 'btn btn-primary btn-sm';
    btnConfirm.style.flex = '2';

    btnConfirm.addEventListener('click', async () => {
        const cantrips = getCantripChoices();
        const spells = getSpellChoices();

        if (preview.newCantripsCount > 0 && cantrips.length !== preview.newCantripsCount) {
            await customAlert(`Choisis exactement ${preview.newCantripsCount} tour(s) de magie.`, 'warning', 'Choix incomplet');
            return;
        }
        if (preview.newSpellsKnownCount > 0 && spells.length !== preview.newSpellsKnownCount) {
            await customAlert(`Choisis exactement ${preview.newSpellsKnownCount} sort(s).`, 'warning', 'Choix incomplet');
            return;
        }

        let abilityImprovement = null;
        if (preview.requiresAbilityScoreImprovement) {
            const choice = getAbilityChoice();
            if (choice.error) {
                await customAlert(choice.error, 'warning', 'Choix invalide');
                return;
            }
            abilityImprovement = choice;
        }

        btnConfirm.disabled = true;
        btnConfirm.textContent = 'Enregistrement...';

        try {
            const response = await authenticatedFetch(
                `${API_BASE_URL}/characters/${characterId}/level-up`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nextLevel: preview.nextLevel,
                        abilityImprovement,
                        chosenCantrips: cantrips,
                        chosenSpells: spells
                    })
                }
            );

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Erreur lors de la montée de niveau');
            }

            document.body.removeChild(overlay);
            await customAlert(
                `Le personnage est maintenant niveau ${preview.nextLevel} !`,
                'success',
                'Niveau supérieur !'
            );
            loadCharacters();

        } catch (err) {
            btnConfirm.disabled = false;
            btnConfirm.textContent = 'Valider la montée de niveau';
            await customAlert(err.message, 'danger', 'Erreur');
        }
    });

    btnRow.appendChild(btnCancel);
    btnRow.appendChild(btnConfirm);
    box.appendChild(btnRow);

    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

function buildSpellPicker(labelText, options, maxChoices) {
    const section = document.createElement('div');
    section.style.cssText = 'margin-bottom:18px;background:#233524;border-radius:6px;padding:14px;';

    const label = document.createElement('div');
    label.textContent = labelText;
    label.style.cssText = 'font-weight:600;margin-bottom:10px;';
    section.appendChild(label);

    const checkboxes = [];

    options.forEach(spell => {
        const row = document.createElement('label');
        row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 0;font-size:13px;cursor:pointer;';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = spell.id;

        checkbox.addEventListener('change', () => {
            const checkedCount = checkboxes.filter(cb => cb.checked).length;
            if (checkedCount >= maxChoices) {
                checkboxes.forEach(cb => { if (!cb.checked) cb.disabled = true; });
            } else {
                checkboxes.forEach(cb => { cb.disabled = false; });
            }
        });

        checkboxes.push(checkbox);

        const text = document.createElement('span');
        text.textContent = spell.level !== undefined && spell.level > 0
            ? `${spell.name} (niveau ${spell.level})`
            : spell.name;

        row.appendChild(checkbox);
        row.appendChild(text);
        section.appendChild(row);
    });

    return {
        section,
        getChoices: () => checkboxes.filter(cb => cb.checked).map(cb => Number(cb.value))
    };
}

// Afficher les personnages avec le nouveau design
function displayCharacters(characters) {
    const grid = document.getElementById('characters-grid');

    const html = characters.map(character => {
        console.log('🎭 Affichage personnage:', character.id, character.name);

        const createdDate = character.created_at
            ? new Date(character.created_at).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
            : 'N/A';

        const proficiencyBonus = getProficiencyBonusDisplay(character.level);
        const canLevelUp = character.level < 20;

        return `
        <div class="card character-card" data-class="${character.class}">
            <div class="character-card-content">
                <div class="character-card-main">
                    <h3 class="character-name-hero">${character.name}</h3>

                    <div class="character-class-line">
                        ${character.class}
                    </div>

                    <div class="character-meta">
                        <div class="character-meta-item">
                            <span class="character-meta-label">Espèce:</span>
                            ${character.species}${character.subspecies ? ` (${character.subspecies})` : ''}
                        </div>
                        <div class="character-meta-item">
                            <span class="character-meta-label">Historique:</span>
                            ${character.background}
                        </div>
                    </div>

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
                            <div class="key-stat-label">Maîtrise</div>
                            <div class="key-stat-value">+${proficiencyBonus}</div>
                        </div>
                    </div>
                </div>

                <div class="character-card-footer">
                    <div class="character-card-primary-actions">
                        <button
                            class="btn btn-primary btn-sm btn-play"
                            data-character-id="${character.id}"
                            data-character-level="${character.level}"
                            title="Jouer avec ce personnage"
                        >
                            Jouer
                        </button>
                        ${canLevelUp ? `
                            <button
                                class="btn btn-outline btn-sm btn-level-up"
                                data-character-id="${character.id}"
                                title="Monter de niveau"
                            >
                                Monter de niveau
                            </button>
                        ` : ''}
                    </div>
                    <div class="character-card-secondary-row">
                        <div class="character-created-date">
                            ${createdDate}
                        </div>
                        <div class="character-card-actions">
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
        </div>
        `;
    }).join('');

    grid.innerHTML = html;

    const playButtons = grid.querySelectorAll('.btn-play');
    playButtons.forEach((btn) => {
        const characterId = btn.getAttribute('data-character-id');
        const characterLevel = Number(btn.getAttribute('data-character-level'));
        btn.addEventListener('click', () => playCharacter(characterId, characterLevel));
    });

    const levelUpButtons = grid.querySelectorAll('.btn-level-up');
    levelUpButtons.forEach((btn) => {
        const characterId = btn.getAttribute('data-character-id');
        btn.addEventListener('click', () => startLevelUp(characterId));
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
    const proficiencyBonus = getProficiencyBonusDisplay(character.level);
    const weapons = (character.items || []).filter(
        i => i.damage_dice
    );
    const modal = document.getElementById('character-modal');
    const modalName = document.getElementById('modal-character-name');
    const modalBody = document.getElementById('modal-body');

    modalName.textContent = character.name;

    const abilities = character.abilities || {};
    const getModifier = (score) => Math.floor((score - 10) / 2);

    modalBody.innerHTML = `
        <div class="character-details">
            <div class="detail-section">
                <h4>Informations générales</h4>
                <p><strong>Espèce:</strong> ${character.species}${character.subspecies ? ` (${character.subspecies})` : ''}</p>
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
                        const abilityLabel = ABILITY_LABELS[ability] || ability;

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

        await customAlert(
            `Le personnage "${characterName}" a été supprimé avec succès.`,
            'success',
            'Suppression réussie'
        );

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