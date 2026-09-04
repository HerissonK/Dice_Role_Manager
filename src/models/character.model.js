const db = require('../config/database');
const RuleValidator = require('../validators/ruleValidator');
const { getProficiencyBonus } = require('../utils/proficiency.util');

/**
 * Calcule la différence d'emplacements de sorts entre deux niveaux,
 * niveau de sort par niveau de sort (ex: {"2": {before: 3, after: 4, gained: 1}}).
 * Ne renvoie que les niveaux de sort où le nombre augmente.
 */
function diffSpellSlots(currentSlots, nextSlots) {
  const diff = {};
  const allSpellLevels = new Set([
    ...Object.keys(currentSlots || {}),
    ...Object.keys(nextSlots || {})
  ]);
 
  for (const spellLevel of allSpellLevels) {
    const before = (currentSlots || {})[spellLevel] || 0;
    const after = (nextSlots || {})[spellLevel] || 0;
    if (after > before) {
      diff[spellLevel] = { before, after, gained: after - before };
    }
  }
 
  return diff;
}

class Character {

  /**
   * Creates a new character with its abilities, chosen skills and equipment,
   * inside a single database transaction (all-or-nothing).
   *
   * @param {object} data - Character data (validated via RuleValidator).
   * @param {string} data.name
   * @param {number} data.level
   * @param {number} data.classId
   * @param {number} data.speciesId
   * @param {number} [data.subspeciesId] - Optional; only set for species with subraces.
   * @param {number} data.backgroundId
   * @param {number} data.userId
   * @param {Object<string, number>} data.abilities
   * @param {string[]} [data.skills]
   * @param {object[]} [data.equipment]
   * @returns {Promise<number>} The newly created character's id.
   */

  /**
   * Indique combien de tours de magie et de sorts un personnage doit choisir
   * à la création (niveau 1) pour une classe donnée, avec la liste des
   * options éligibles. Ne dépend d'aucun personnage existant — utilisé par
   * le builder avant même que le personnage soit créé.
   *
   * @param {number} classId
   * @returns {Promise<{cantripsToChoose: number, spellsToChoose: number, eligibleCantrips: object[], eligibleSpells: object[]}>}
   */
  static async getStartingSpellcasting(classId) {
    const slotsRow = (await db.query(
      `SELECT cantrips_known, spells_known FROM dnd_class_spell_slots WHERE class_id = $1 AND level = 1`,
      [classId]
    )).rows[0] || null;
  
    const cantripsToChoose = slotsRow?.cantrips_known || 0;
    const spellsToChoose = (slotsRow && slotsRow.spells_known !== null) ? slotsRow.spells_known : 0;
  
    let eligibleCantrips = [];
    if (cantripsToChoose > 0) {
      eligibleCantrips = (await db.query(
        `SELECT sp.id, sp.name, sp.school
        FROM dnd_spell sp
        JOIN dnd_spell_class sc ON sc.spell_id = sp.id
        WHERE sc.class_id = $1 AND sp.level = 0
        ORDER BY sp.name`,
        [classId]
      )).rows;
    }
  
    let eligibleSpells = [];
    if (spellsToChoose > 0) {
      eligibleSpells = (await db.query(
        `SELECT sp.id, sp.name, sp.level, sp.school
        FROM dnd_spell sp
        JOIN dnd_spell_class sc ON sc.spell_id = sp.id
        WHERE sc.class_id = $1 AND sp.level > 0
        ORDER BY sp.level, sp.name`,
        [classId]
      )).rows;
    }
  
    return { cantripsToChoose, spellsToChoose, eligibleCantrips, eligibleSpells };
  }
  
  
  static async create(data) {
    RuleValidator.validateCharacter(data);

    const {
      name,
      level,
      classId,
      speciesId,
      subspeciesId,
      backgroundId,
      abilities,
      userId,
      skills,
      equipment,
      knownSpells
    } = data;

    if (!name) {
      throw new Error('Character name is required');
    }

    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // 1. Créer le personnage
      const result = await client.query(
        `INSERT INTO personnage
         (name, level, class_id, species_id, subspecies_id, background_id, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [name, level, classId, speciesId, subspeciesId || null, backgroundId, userId]
      );

      const characterId = result.rows[0].id;

      // 2. Sauvegarder les caractéristiques
      for (const [ability, value] of Object.entries(abilities)) {
        await client.query(
          `INSERT INTO personnage_caracteristique
           (personnage_id, caracteristique, valeur)
           VALUES ($1, $2, $3)`,
          [characterId, ability, value]
        );
      }

      // 3. Sauvegarder les compétences choisies
      if (skills && Array.isArray(skills) && skills.length > 0) {
        for (const skillName of skills) {
          await client.query(
            `INSERT INTO personnage_skill
             (personnage_id, skill_name, source)
             VALUES ($1, $2, $3)
             ON CONFLICT (personnage_id, skill_name) DO NOTHING`,
            [characterId, skillName, 'class']
          );
        }
        console.log(`✅ ${skills.length} compétences sauvegardées pour personnage ${characterId}`);
      }

      if (knownSpells && Array.isArray(knownSpells) && knownSpells.length > 0) {
        for (const spellId of knownSpells) {
          // Vérifie que le sort appartient bien à la liste de la classe
          // choisie, avant de l'enregistrer (même logique de prudence que
          // pour la montée de niveau : ne jamais faire confiance à un id
          // envoyé par le client sans le confronter à la base).
          const valid = await client.query(
            `SELECT sp.id FROM dnd_spell sp
             JOIN dnd_spell_class sc ON sc.spell_id = sp.id
             WHERE sp.id = $1 AND sc.class_id = $2`,
            [spellId, classId]
          );
          if (!valid.rows.length) {
            throw new Error(`Sort id=${spellId} invalide pour cette classe`);
          }
 
          await client.query(
            `INSERT INTO personnage_known_spell (personnage_id, spell_id, level_learned)
             VALUES ($1, $2, $3)
             ON CONFLICT (personnage_id, spell_id) DO NOTHING`,
            [characterId, spellId, level]
          );
        }
        console.log(`✅ ${knownSpells.length} sort(s)/tour(s) de magie sauvegardé(s) pour personnage ${characterId}`);
      }     

      // ✅ 4. Sauvegarder les items équipés
      if (equipment && Array.isArray(equipment) && equipment.length > 0) {
        let itemsSaved = 0;

        for (const item of equipment) {
          // Ignorer les items sans damage_dice ET sans armor_class (= équipement non-combat)
          // On garde seulement les armes, armures et boucliers
          const isCombatItem = item.damage_dice || item.damage || item.armor_class || item.category;
          if (!isCombatItem) continue;

          let itemId = null;

          // 🔑 Chercher par nom (insensible à la casse et aux accents)
          if (item.name) {
            const itemResult = await client.query(
              `SELECT id FROM item 
               WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) 
               LIMIT 1`,
              [item.name]
            );

            if (itemResult.rows.length > 0) {
              itemId = itemResult.rows[0].id;
            } else {
              // ⚠️ Item non trouvé : l'insérer à la volée
              console.warn(`⚠️ Item "${item.name}" non trouvé en DB → insertion à la volée`);

              // Déterminer la catégorie
              let dbCategory = 'gear';
              if (item.damage_dice || item.damage) dbCategory = 'weapon';
              else if (item.category === 'shield') dbCategory = 'shield';
              else if (item.category?.startsWith('armor')) dbCategory = 'armor';

              // Normaliser damage_dice (peut s'appeler "damage" dans data.js)
              const damageDice = item.damage_dice || item.damage || null;

              const insertResult = await client.query(
                `INSERT INTO item (name, category, damage_dice, damage_type, armor_class, dex_modifier_rule, properties)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 RETURNING id`,
                [
                  item.name,
                  dbCategory,
                  damageDice,
                  item.damage_type || item.damageType || null,
                  item.armor_class || null,
                  item.dex_modifier_rule || null,
                  JSON.stringify(item.properties || [])
                ]
              );

              itemId = insertResult.rows[0].id;
              console.log(`✅ Item "${item.name}" inséré avec id ${itemId}`);
            }
          }

          if (itemId) {
            await client.query(
              `INSERT INTO personnage_item (personnage_id, item_id, equipped)
               VALUES ($1, $2, true)
               ON CONFLICT (personnage_id, item_id) DO NOTHING`,
              [characterId, itemId]
            );
            itemsSaved++;
          }
        }

        console.log(`✅ ${itemsSaved} items équipés pour personnage ${characterId}`);
      }

      await client.query('COMMIT');
      return characterId;

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Erreur création personnage:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  /* ======================
     FIND ONE (DETAIL)
  ====================== */
  static async findById(id, userId) {
    // Récupérer les infos du personnage, y compris la sous-espèce si elle existe
    // (LEFT JOIN car subspecies_id peut être NULL pour les espèces qui n'en ont pas)
    const characterResult = await db.query(
      `SELECT
        p.id,
        p.name,
        p.level,
        c.name AS class,
        c.hit_die,
        s.name AS species,
        s.ability_bonuses AS racial_bonuses,
        s.speed AS species_speed,
        sub.name AS subspecies_name,
        sub.ability_bonuses AS subspecies_bonuses,
        sub.speed_override AS subspecies_speed_override,
        b.name AS background,
        b.skill_proficiencies AS background_skills,
        pc.str,
        pc.dex,
        pc.con,
        pc.int,
        pc.wis,
        pc.cha
      FROM personnage p
      JOIN dnd_class c ON c.id = p.class_id
      JOIN dnd_species s ON s.id = p.species_id
      LEFT JOIN dnd_subspecies sub ON sub.id = p.subspecies_id
      JOIN dnd_background b ON b.id = p.background_id
      LEFT JOIN (
        SELECT personnage_id,
          MAX(CASE WHEN caracteristique = 'str' THEN valeur END) AS str,
          MAX(CASE WHEN caracteristique = 'dex' THEN valeur END) AS dex,
          MAX(CASE WHEN caracteristique = 'con' THEN valeur END) AS con,
          MAX(CASE WHEN caracteristique = 'int' THEN valeur END) AS int,
          MAX(CASE WHEN caracteristique = 'wis' THEN valeur END) AS wis,
          MAX(CASE WHEN caracteristique = 'cha' THEN valeur END) AS cha
        FROM personnage_caracteristique
        GROUP BY personnage_id
      ) pc ON pc.personnage_id = p.id
      WHERE p.id = $1 AND p.user_id = $2`,
      [id, userId]
    );

    if (!characterResult.rows.length) return null;

    const row = characterResult.rows[0];

    // Récupérer les compétences de classe stockées
    const skillsResult = await db.query(
      `SELECT skill_name, source
       FROM personnage_skill
       WHERE personnage_id = $1`,
      [id]
    );
    
    const classSkills = skillsResult.rows
      .filter(r => r.source === 'class')
      .map(r => r.skill_name);
    
    // Fusionner compétences background + classe
    const backgroundSkills = row.background_skills || [];
    const allSkills = [...new Set([...backgroundSkills, ...classSkills])];
    
    console.log('📋 Compétences background:', backgroundSkills);
    console.log('📋 Compétences classe:', classSkills);
    console.log('✅ Compétences totales:', allSkills);

    // Caractéristiques de base (SANS bonus raciaux ni de sous-espèce)
    const baseAbilities = {
      str: row.str ?? 10,
      dex: row.dex ?? 10,
      con: row.con ?? 10,
      int: row.int ?? 10,
      wis: row.wis ?? 10,
      cha: row.cha ?? 10
    };

    // Appliquer les bonus raciaux (espèce), puis les bonus de sous-espèce
    // par-dessus. Les deux niveaux sont additifs (ex: Nain des montagnes =
    // aucun bonus d'espèce de base + bonus de sous-espèce {"str":2}).
    const racialBonuses = row.racial_bonuses || {};
    const subspeciesBonuses = row.subspecies_bonuses || {};
    const finalAbilities = { ...baseAbilities };

    for (const [ability, bonus] of Object.entries(racialBonuses)) {
      if (finalAbilities[ability] !== undefined && bonus) {
        finalAbilities[ability] += bonus;
      }
    }
    for (const [ability, bonus] of Object.entries(subspeciesBonuses)) {
      if (finalAbilities[ability] !== undefined && bonus) {
        finalAbilities[ability] += bonus;
      }
    }
    
    console.log('📊 Caractéristiques de base:', baseAbilities);
    console.log('📊 Bonus raciaux (espèce):', racialBonuses);
    console.log('📊 Bonus de sous-espèce:', subspeciesBonuses);
    console.log('✅ Caractéristiques finales:', finalAbilities);

    // Calculer PV et CA avec les caractéristiques FINALES
    const conMod = Math.floor((finalAbilities.con - 10) / 2);
    const baseHit = row.hit_die;
    const level = row.level;

    const pv = Math.floor(
      baseHit + conMod + ((baseHit / 2) + 1 + conMod) * (level - 1)
    );

    const items = await this.getEquippedItems(row.id, userId);
    const armorClass = this.calculateArmorClass(finalAbilities, items);

    // La sous-espèce peut remplacer la vitesse de l'espèce (ex: Elfe sylvestre = 35)
    const speed = row.subspecies_speed_override ?? row.species_speed;

    return {
      id: row.id,
      name: row.name,
      level: row.level,
      class: row.class,
      species: row.species,
      subspecies: row.subspecies_name || null,
      speed,
      background: row.background,
      pv,
      armorClass,
      abilities: finalAbilities,
      skills: allSkills,
      items
    };
  }

  /**
 * Computes a character's full state as it would be at a chosen play level,
 * which may be lower than (but never higher than) the character's maximum
 * level reached. This is what powers "play this character at an earlier
 * level" and "let a GM hand out pre-built characters at various levels".
 *
 * Unlike findById() (which always returns the character at its maximum
 * level), this method re-derives everything that depends on level:
 * proficiency bonus, hit points, unlocked class features, spell slots,
 * and ability score improvements (only those chosen at a level <= targetLevel).
 *
 * @param {number} id - Character id.
 * @param {number} userId - Owning user id (ownership check, same as findById).
 * @param {number} targetLevel - The level to play at (1 <= targetLevel <= character's max level).
 * @returns {Promise<object|null>} The computed character state, or null if not found/not owned.
 * @throws {Error} If targetLevel exceeds the character's maximum level reached.
 */
  static async getCharacterAtLevel(id, userId, targetLevel) {
    // Réutilise la même requête principale que findById (personnage + jointures
    // classe/espèce/sous-espèce/historique + caractéristiques pivotées).
    const characterResult = await db.query(
      `SELECT
        p.id,
        p.name,
        p.level AS max_level,
        p.class_id,
        c.name AS class,
        c.hit_die,
        s.name AS species,
        s.ability_bonuses AS racial_bonuses,
        sub.name AS subspecies_name,
        sub.ability_bonuses AS subspecies_bonuses,
        b.name AS background,
        b.skill_proficiencies AS background_skills,
        pc.str,
        pc.dex,
        pc.con,
        pc.int,
        pc.wis,
        pc.cha
      FROM personnage p
      JOIN dnd_class c ON c.id = p.class_id
      JOIN dnd_species s ON s.id = p.species_id
      LEFT JOIN dnd_subspecies sub ON sub.id = p.subspecies_id
      JOIN dnd_background b ON b.id = p.background_id
      LEFT JOIN (
        SELECT personnage_id,
          MAX(CASE WHEN caracteristique = 'str' THEN valeur END) AS str,
          MAX(CASE WHEN caracteristique = 'dex' THEN valeur END) AS dex,
          MAX(CASE WHEN caracteristique = 'con' THEN valeur END) AS con,
          MAX(CASE WHEN caracteristique = 'int' THEN valeur END) AS int,
          MAX(CASE WHEN caracteristique = 'wis' THEN valeur END) AS wis,
          MAX(CASE WHEN caracteristique = 'cha' THEN valeur END) AS cha
        FROM personnage_caracteristique
        GROUP BY personnage_id
      ) pc ON pc.personnage_id = p.id
      WHERE p.id = $1 AND p.user_id = $2`,
      [id, userId]
    );
  
    if (!characterResult.rows.length) return null;
  
    const row = characterResult.rows[0];
  
    if (targetLevel > row.max_level) {
      throw new Error(
        `Niveau de jeu demandé (${targetLevel}) supérieur au niveau maximum atteint (${row.max_level})`
      );
    }
  
    // 1. Caractéristiques de base + bonus raciaux + sous-espèce (identique à findById)
    const baseAbilities = {
      str: row.str ?? 10, dex: row.dex ?? 10, con: row.con ?? 10,
      int: row.int ?? 10, wis: row.wis ?? 10, cha: row.cha ?? 10
    };
    const finalAbilities = { ...baseAbilities };
  
    for (const [ability, bonus] of Object.entries(row.racial_bonuses || {})) {
      if (finalAbilities[ability] !== undefined && bonus) finalAbilities[ability] += bonus;
    }
    for (const [ability, bonus] of Object.entries(row.subspecies_bonuses || {})) {
      if (finalAbilities[ability] !== undefined && bonus) finalAbilities[ability] += bonus;
    }
  
    // 2. Améliorations de caractéristiques (ASI) choisies jusqu'au niveau de jeu
    //    (un personnage niveau max 10 joué à niveau 6 ne doit PAS bénéficier
    //    de l'ASI qu'il aurait choisi à un palier 8, par exemple)
    const asiResult = await db.query(
      `SELECT ability_1, amount_1, ability_2, amount_2
      FROM personnage_asi
      WHERE personnage_id = $1 AND level <= $2
      ORDER BY level`,
      [id, targetLevel]
    );
  
    for (const asi of asiResult.rows) {
      if (asi.ability_1 && finalAbilities[asi.ability_1] !== undefined) {
        finalAbilities[asi.ability_1] += asi.amount_1;
      }
      if (asi.ability_2 && finalAbilities[asi.ability_2] !== undefined) {
        finalAbilities[asi.ability_2] += asi.amount_2;
      }
    }
  
    // 3. Bonus de maîtrise recalculé pour le niveau de jeu choisi (corrige le
    //    +2 codé en dur utilisé jusqu'ici partout dans le projet)
    const proficiencyBonus = getProficiencyBonus(targetLevel);
  
    // 4. Points de vie recalculés pour le niveau de jeu choisi
    const conMod = Math.floor((finalAbilities.con - 10) / 2);
    const pv = Math.floor(
      row.hit_die + conMod + ((row.hit_die / 2) + 1 + conMod) * (targetLevel - 1)
    );
  
    // 5. Classe d'armure (inchangé, dépend des objets équipés et de DEX finale)
    const items = await this.getEquippedItems(row.id, userId);
    const armorClass = this.calculateArmorClass(finalAbilities, items);
  
    // 6. Compétences maîtrisées (identique à findById — non dépendantes du niveau)
    const skillsResult = await db.query(
      `SELECT skill_name, source FROM personnage_skill WHERE personnage_id = $1`,
      [id]
    );
    const classSkills = skillsResult.rows.filter(r => r.source === 'class').map(r => r.skill_name);
    const backgroundSkills = row.background_skills || [];
    const allSkills = [...new Set([...backgroundSkills, ...classSkills])];
  
    // 7. Features de classe débloquées jusqu'au niveau de jeu choisi
    const featuresResult = await db.query(
      `SELECT id, level, name, description, action_type, uses_formula, recharge
      FROM dnd_class_feature
      WHERE class_id = $1 AND level <= $2
      ORDER BY level`,
      [row.class_id, targetLevel]
    );
  
    // 8. Emplacements de sorts EXACTEMENT au niveau de jeu choisi (pas cumulés :
    //    la ligne dnd_class_spell_slots à ce niveau contient déjà le total)
    const slotsResult = await db.query(
      `SELECT cantrips_known, spells_known, slots
      FROM dnd_class_spell_slots
      WHERE class_id = $1 AND level = $2`,
      [row.class_id, targetLevel]
    );
    const spellSlots = slotsResult.rows[0] || null; // null = classe non lanceuse de sorts
  
    // 9. Sorts connus, filtrés par niveau d'apprentissage <= niveau de jeu
    //    (uniquement pertinent pour les classes "à sorts connus" ; vide sinon)
    const knownSpellsResult = await db.query(
      `SELECT sp.id, sp.name, sp.level, sp.school, sp.concentration, sp.ritual, ks.level_learned
      FROM personnage_known_spell ks
      JOIN dnd_spell sp ON sp.id = ks.spell_id
      WHERE ks.personnage_id = $1 AND ks.level_learned <= $2
      ORDER BY sp.level, sp.name`,
      [id, targetLevel]
    );
  
    return {
      id: row.id,
      name: row.name,
      maxLevel: row.max_level,
      playedAtLevel: targetLevel,
      class: row.class,
      species: row.species,
      subspecies: row.subspecies_name || null,
      background: row.background,
      proficiencyBonus,
      pv,
      armorClass,
      abilities: finalAbilities,
      skills: allSkills,
      items,
      features: featuresResult.rows,
      spellSlots,
      knownSpells: knownSpellsResult.rows
    };
  }

  /* ======================
     FIND ALL (LIST)
  ====================== */
  static async findAllByUser(userId) {
    const result = await db.query(
      `SELECT
        p.id,
        p.name,
        p.level,
        p.created_at,
        c.name AS class,
        c.hit_die,
        s.name AS species,
        s.ability_bonuses AS racial_bonuses,
        sub.name AS subspecies_name,
        sub.ability_bonuses AS subspecies_bonuses,
        b.name AS background,
        pc.str,
        pc.dex,
        pc.con,
        pc.int,
        pc.wis,
        pc.cha
      FROM personnage p
      JOIN dnd_class c ON c.id = p.class_id
      JOIN dnd_species s ON s.id = p.species_id
      LEFT JOIN dnd_subspecies sub ON sub.id = p.subspecies_id
      JOIN dnd_background b ON b.id = p.background_id
      LEFT JOIN (
        SELECT personnage_id,
              MAX(CASE WHEN caracteristique = 'str' THEN valeur END) AS str,
              MAX(CASE WHEN caracteristique = 'dex' THEN valeur END) AS dex,
              MAX(CASE WHEN caracteristique = 'con' THEN valeur END) AS con,
              MAX(CASE WHEN caracteristique = 'int' THEN valeur END) AS int,
              MAX(CASE WHEN caracteristique = 'wis' THEN valeur END) AS wis,
              MAX(CASE WHEN caracteristique = 'cha' THEN valeur END) AS cha
        FROM personnage_caracteristique
        GROUP BY personnage_id
      ) pc ON pc.personnage_id = p.id
      WHERE p.user_id = $1
      ORDER BY p.created_at DESC`,
      [userId]
    );

    return result.rows.map(row => {
      // Caractéristiques de base
      const baseAbilities = {
        str: row.str ?? 10,
        dex: row.dex ?? 10,
        con: row.con ?? 10,
        int: row.int ?? 10,
        wis: row.wis ?? 10,
        cha: row.cha ?? 10
      };

      // Appliquer bonus raciaux (espèce) puis bonus de sous-espèce
      const racialBonuses = row.racial_bonuses || {};
      const subspeciesBonuses = row.subspecies_bonuses || {};
      const finalAbilities = { ...baseAbilities };

      for (const [ability, bonus] of Object.entries(racialBonuses)) {
        if (finalAbilities[ability] !== undefined && bonus) {
          finalAbilities[ability] += bonus;
        }
      }
      for (const [ability, bonus] of Object.entries(subspeciesBonuses)) {
        if (finalAbilities[ability] !== undefined && bonus) {
          finalAbilities[ability] += bonus;
        }
      }

      // Calculer PV avec CON finale
      const conMod = Math.floor((finalAbilities.con - 10) / 2);
      const pv = Math.floor(
        row.hit_die + conMod + ((row.hit_die / 2) + 1 + conMod) * (row.level - 1)
      );

      return {
        id: row.id,
        name: row.name,
        level: row.level,
        class: row.class,
        species: row.species,
        subspecies: row.subspecies_name || null,
        background: row.background,
        pv,
        created_at: row.created_at
      };
    });
  }

  /**
   * Calculates a character's Armor Class (AC) from their Dexterity modifier
   * and equipped items, following the D&D 5e ruleset.
   *
   * Rules applied:
   *  - No armor equipped: AC = 10 + DEX modifier (+ shield bonus if any).
   *  - Light armor (`dex_modifier_rule: 'full'`): full DEX modifier applies.
   *  - Medium armor (`dex_modifier_rule: 'max2'`): DEX modifier capped at +2.
   *  - Heavy armor (`dex_modifier_rule: 'none'`): DEX modifier ignored.
   *  - A shield always adds a flat bonus (default +2) on top of the above.
   *
   * This is a pure function: it performs no database access and is safe to
   * unit test in isolation (see tests/character.model.test.js).
   *
   * @param {{dex: number}} abilities - Character's final ability scores (after racial bonuses).
   * @param {Array<{category: string, armor_class?: number, dex_modifier_rule?: string}>} items - Equipped items.
   * @returns {number} The computed Armor Class.
   */
static calculateArmorClass(abilities, items) {
  const dexMod = Math.floor((abilities.dex - 10) / 2);

  let baseArmor = null;
  let dexRule = 'full';
  let shieldBonus = 0;

  for (const item of items) {
    const category = item.category || '';

    if (category.startsWith('armor') || category === 'armor') {
      baseArmor = item.armor_class;
      dexRule = item.dex_modifier_rule || 'full';
    }

    if (category === 'shield') {
      shieldBonus += item.armor_class || 2;
    }
  }

  if (!baseArmor) {
    return 10 + dexMod + shieldBonus;
  }

  let dexBonus = 0;
  if (dexRule === 'full') dexBonus = dexMod;
  if (dexRule === 'max2') dexBonus = Math.min(dexMod, 2);
  if (dexRule === 'none') dexBonus = 0;

  return baseArmor + dexBonus + shieldBonus;
}

  /* ======================
     EQUIPPED ITEMS
  ====================== */
  static async getEquippedItems(characterId, userId) {
    const result = await db.query(
      `SELECT
        i.id,
        i.name,
        i.category,
        i.armor_class,
        i.dex_modifier_rule,
        i.damage_dice,
        i.damage_type,
        i.properties
      FROM personnage_item pi
      JOIN item i ON i.id = pi.item_id
      JOIN personnage p ON p.id = pi.personnage_id
      WHERE pi.personnage_id = $1
        AND pi.equipped = true
        AND p.user_id = $2`,
      [characterId, userId]
    );

    return result.rows;
  }

  /**
   * Updates a character's core fields and ability scores. Only affects rows
   * owned by the given user (WHERE id AND user_id).
   *
   * @param {number} id
   * @param {number} userId
   * @param {object} data - Updated character data (validated via RuleValidator).
   * @returns {Promise<boolean>} True if a row was updated, false if not found/not owned.
   */
  static async updateById(id, userId, data) {
    RuleValidator.validateCharacter(data);
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      const updateResult = await client.query(
        `UPDATE personnage
         SET name = $1,
             level = $2,
             class_id = $3,
             species_id = $4,
             subspecies_id = $5,
             background_id = $6
         WHERE id = $7 AND user_id = $8`,
        [
          data.name,
          data.level,
          data.classId,
          data.speciesId,
          data.subspeciesId || null,
          data.backgroundId,
          id,
          userId
        ]
      );

      if (updateResult.rowCount === 0) {
        await client.query('ROLLBACK');
        return false;
      }

      for (const [ability, value] of Object.entries(data.abilities)) {
        await client.query(
          `INSERT INTO personnage_caracteristique
           (personnage_id, caracteristique, valeur)
           VALUES ($1, $2, $3)
           ON CONFLICT (personnage_id, caracteristique)
           DO UPDATE SET valeur = EXCLUDED.valeur`,
          [id, ability, value]
        );
      }

      await client.query('COMMIT');
      return true;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

/**
 * Calcule ce qui attend un personnage au prochain niveau, sans rien
 * modifier : nouvelles features, PV gagnés, évolution du bonus de
 * maîtrise, nouveaux emplacements de sorts, amélioration de
 * caractéristiques requise ou non, et les sorts/tours de magie éligibles.
 *
 * @param {number} id
 * @param {number} userId
 * @returns {Promise<object|null>} L'aperçu, ou null si personnage introuvable/non possédé.
 * @throws {Error} Si le personnage a déjà atteint le niveau 20.
 */
static async getLevelUpPreview(id, userId) {
  const result = await db.query(
    `SELECT p.level AS current_level, p.class_id, c.name AS class, c.hit_die,
            s.ability_bonuses AS racial_bonuses,
            sub.ability_bonuses AS subspecies_bonuses,
            pc.con
     FROM personnage p
     JOIN dnd_class c ON c.id = p.class_id
     JOIN dnd_species s ON s.id = p.species_id
     LEFT JOIN dnd_subspecies sub ON sub.id = p.subspecies_id
     LEFT JOIN (
       SELECT personnage_id,
         MAX(CASE WHEN caracteristique = 'con' THEN valeur END) AS con
       FROM personnage_caracteristique
       GROUP BY personnage_id
     ) pc ON pc.personnage_id = p.id
     WHERE p.id = $1 AND p.user_id = $2`,
    [id, userId]
  );
  if (!result.rows.length) return null;
 
  const {
    current_level: currentLevel,
    class_id: classId,
    class: className,
    hit_die: hitDie,
    racial_bonuses: racialBonuses,
    subspecies_bonuses: subspeciesBonuses,
    con: baseCon
  } = result.rows[0];
 
  const nextLevel = currentLevel + 1;
  if (nextLevel > 20) {
    throw new Error('Ce personnage a déjà atteint le niveau maximum (20)');
  }
 
  // ---- Constitution finale (espèce + sous-espèce + ASI déjà choisis
  // jusqu'au niveau actuel — PAS l'ASI de cette montée de niveau, qui
  // n'est pas encore choisi au moment de l'aperçu) ----
  let finalCon = baseCon ?? 10;
  finalCon += (racialBonuses || {}).con || 0;
  finalCon += (subspeciesBonuses || {}).con || 0;
 
  const asiRows = (await db.query(
    `SELECT ability_1, amount_1, ability_2, amount_2
     FROM personnage_asi WHERE personnage_id = $1 AND level <= $2`,
    [id, currentLevel]
  )).rows;
  for (const asi of asiRows) {
    if (asi.ability_1 === 'con') finalCon += asi.amount_1;
    if (asi.ability_2 === 'con') finalCon += asi.amount_2;
  }
 
  const conMod = Math.floor((finalCon - 10) / 2);
  const pvAtLevel = (level) =>
    Math.floor(hitDie + conMod + ((hitDie / 2) + 1 + conMod) * (level - 1));
 
  const currentPv = pvAtLevel(currentLevel);
  const nextPv = pvAtLevel(nextLevel);
 
  // ---- Bonus de maîtrise ----
  const currentProficiencyBonus = getProficiencyBonus(currentLevel);
  const nextProficiencyBonus = getProficiencyBonus(nextLevel);
 
  const requiresAbilityScoreImprovement = [4, 8, 12, 16, 19].includes(nextLevel);
 
  const featuresResult = await db.query(
    `SELECT id, name, description, action_type, uses_formula, recharge
     FROM dnd_class_feature
     WHERE class_id = $1 AND level = $2
     ORDER BY name`,
    [classId, nextLevel]
  );
 
  const currentSlotsRow = (await db.query(
    `SELECT cantrips_known, spells_known, slots FROM dnd_class_spell_slots WHERE class_id = $1 AND level = $2`,
    [classId, currentLevel]
  )).rows[0] || null;
 
  const nextSlotsRow = (await db.query(
    `SELECT cantrips_known, spells_known, slots FROM dnd_class_spell_slots WHERE class_id = $1 AND level = $2`,
    [classId, nextLevel]
  )).rows[0] || null;
 
  let newCantripsCount = 0;
  let newSpellsKnownCount = 0;
  let spellSlotChanges = {};
 
  if (nextSlotsRow) {
    newCantripsCount = Math.max(0, (nextSlotsRow.cantrips_known || 0) - (currentSlotsRow?.cantrips_known || 0));
    if (nextSlotsRow.spells_known !== null) {
      newSpellsKnownCount = Math.max(0, nextSlotsRow.spells_known - (currentSlotsRow?.spells_known || 0));
    }
    spellSlotChanges = diffSpellSlots(currentSlotsRow?.slots, nextSlotsRow.slots);
  }
 
  const knownIds = (await db.query(
    `SELECT spell_id FROM personnage_known_spell WHERE personnage_id = $1`,
    [id]
  )).rows.map(r => r.spell_id);
 
  let eligibleCantrips = [];
  if (newCantripsCount > 0) {
    const params = knownIds.length ? [classId, 0, knownIds] : [classId, 0];
    const excludeClause = knownIds.length ? 'AND sp.id != ALL($3)' : '';
    eligibleCantrips = (await db.query(
      `SELECT sp.id, sp.name, sp.school
       FROM dnd_spell sp
       JOIN dnd_spell_class sc ON sc.spell_id = sp.id
       WHERE sc.class_id = $1 AND sp.level = $2 ${excludeClause}
       ORDER BY sp.name`,
      params
    )).rows;
  }
 
  let eligibleSpells = [];
  if (newSpellsKnownCount > 0) {
    const params = knownIds.length ? [classId, knownIds] : [classId];
    const excludeClause = knownIds.length ? 'AND sp.id != ALL($2)' : '';
    eligibleSpells = (await db.query(
      `SELECT sp.id, sp.name, sp.level, sp.school
       FROM dnd_spell sp
       JOIN dnd_spell_class sc ON sc.spell_id = sp.id
       WHERE sc.class_id = $1 AND sp.level > 0 ${excludeClause}
       ORDER BY sp.level, sp.name`,
      params
    )).rows;
  }
 
  return {
    characterId: id,
    class: className,
    currentLevel,
    nextLevel,
    currentPv,
    nextPv,
    hpGain: nextPv - currentPv,
    currentProficiencyBonus,
    nextProficiencyBonus,
    proficiencyBonusIncreases: nextProficiencyBonus > currentProficiencyBonus,
    requiresAbilityScoreImprovement,
    newFeatures: featuresResult.rows,
    spellSlotChanges,
    newCantripsCount,
    eligibleCantrips,
    newSpellsKnownCount,
    eligibleSpells
  };
}

/**
 * Applique une montée de niveau, en revalidant intégralement côté serveur
 * tout ce qui est obligatoire (jamais confiance sur le client concernant
 * CE QUI doit être choisi — uniquement sur LA VALEUR de ses choix).
 *
 * @param {number} id
 * @param {number} userId
 * @param {number} nextLevel - Doit être exactement currentLevel + 1.
 * @param {object} choices
 * @param {{ability1: string, amount1: number, ability2?: string, amount2?: number}} [choices.abilityImprovement]
 * @param {number[]} [choices.chosenCantrips] - IDs de sorts (dnd_spell.level = 0)
 * @param {number[]} [choices.chosenSpells] - IDs de sorts (dnd_spell.level > 0)
 * @returns {Promise<{success: boolean, newLevel?: number, reason?: string}>}
 * @throws {Error} Si un choix est manquant, invalide, ou incohérent avec le niveau actuel réel.
 */
static async applyLevelUp(id, userId, nextLevel, choices = {}) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Relire l'état réel depuis la base — jamais confiance sur ce que le
    // client pense être le niveau actuel du personnage.
    const charResult = await client.query(
      `SELECT level, class_id FROM personnage WHERE id = $1 AND user_id = $2 FOR UPDATE`,
      [id, userId]
    );

    if (!charResult.rows.length) {
      await client.query('ROLLBACK');
      return { success: false, reason: 'not_found' };
    }

    const { level: currentLevel, class_id: classId } = charResult.rows[0];
    const expectedNextLevel = currentLevel + 1;

    if (nextLevel !== expectedNextLevel) {
      throw new Error(
        `Niveau demandé (${nextLevel}) incohérent avec le niveau actuel (${currentLevel}). Une seule montée de niveau à la fois, dans l'ordre.`
      );
    }
    if (nextLevel > 20) {
      throw new Error('Niveau maximum (20) déjà atteint');
    }

    // ---- Amélioration de caractéristiques ----
    const requiresASI = [4, 8, 12, 16, 19].includes(nextLevel);

    if (requiresASI) {
      const improvement = choices.abilityImprovement;
      if (!improvement) {
        throw new Error(`Une amélioration de caractéristiques est requise au niveau ${nextLevel}`);
      }

      const { ability1, amount1, ability2, amount2 } = improvement;
      const validAbilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

      if (!validAbilities.includes(ability1)) {
        throw new Error('Caractéristique invalide');
      }

      if (ability2) {
        // Cas "+1 dans deux caractéristiques"
        if (!validAbilities.includes(ability2) || amount1 !== 1 || amount2 !== 1) {
          throw new Error('Pour deux caractéristiques, chacune doit recevoir exactement +1');
        }
      } else if (amount1 !== 2) {
        // Cas "+2 dans une seule caractéristique"
        throw new Error('Pour une seule caractéristique, le bonus doit être exactement +2');
      }

      await client.query(
        `INSERT INTO personnage_asi (personnage_id, level, ability_1, amount_1, ability_2, amount_2)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, nextLevel, ability1, amount1, ability2 || null, ability2 ? amount2 : null]
      );
    } else if (choices.abilityImprovement) {
      throw new Error(`Aucune amélioration de caractéristiques attendue au niveau ${nextLevel}`);
    }

    // ---- Tours de magie et sorts — quantités attendues recalculées ici,
    // jamais lues depuis ce que le client a pu envoyer en plus ----
    const currentSlots = (await client.query(
      `SELECT cantrips_known, spells_known FROM dnd_class_spell_slots WHERE class_id = $1 AND level = $2`,
      [classId, currentLevel]
    )).rows[0] || null;

    const nextSlots = (await client.query(
      `SELECT cantrips_known, spells_known FROM dnd_class_spell_slots WHERE class_id = $1 AND level = $2`,
      [classId, nextLevel]
    )).rows[0] || null;

    let expectedCantrips = 0;
    let expectedSpellsKnown = 0;
    if (nextSlots) {
      expectedCantrips = Math.max(0, (nextSlots.cantrips_known || 0) - (currentSlots?.cantrips_known || 0));
      if (nextSlots.spells_known !== null) {
        expectedSpellsKnown = Math.max(0, nextSlots.spells_known - (currentSlots?.spells_known || 0));
      }
    }

    const chosenCantrips = choices.chosenCantrips || [];
    const chosenSpells = choices.chosenSpells || [];

    if (chosenCantrips.length !== expectedCantrips) {
      throw new Error(`Nombre de tours de magie choisis invalide (attendu : ${expectedCantrips})`);
    }
    if (chosenSpells.length !== expectedSpellsKnown) {
      throw new Error(`Nombre de sorts choisis invalide (attendu : ${expectedSpellsKnown})`);
    }

    for (const spellId of chosenCantrips) {
      const valid = await client.query(
        `SELECT sp.id FROM dnd_spell sp
         JOIN dnd_spell_class sc ON sc.spell_id = sp.id
         WHERE sp.id = $1 AND sc.class_id = $2 AND sp.level = 0`,
        [spellId, classId]
      );
      if (!valid.rows.length) throw new Error(`Tour de magie id=${spellId} invalide pour cette classe`);

      await client.query(
        `INSERT INTO personnage_known_spell (personnage_id, spell_id, level_learned)
         VALUES ($1, $2, $3)
         ON CONFLICT (personnage_id, spell_id) DO NOTHING`,
        [id, spellId, nextLevel]
      );
    }

    for (const spellId of chosenSpells) {
      const valid = await client.query(
        `SELECT sp.id FROM dnd_spell sp
         JOIN dnd_spell_class sc ON sc.spell_id = sp.id
         WHERE sp.id = $1 AND sc.class_id = $2 AND sp.level > 0`,
        [spellId, classId]
      );
      if (!valid.rows.length) throw new Error(`Sort id=${spellId} invalide pour cette classe`);

      await client.query(
        `INSERT INTO personnage_known_spell (personnage_id, spell_id, level_learned)
         VALUES ($1, $2, $3)
         ON CONFLICT (personnage_id, spell_id) DO NOTHING`,
        [id, spellId, nextLevel]
      );
    }

    // ---- Enfin, faire progresser le niveau maximum du personnage ----
    await client.query(
      `UPDATE personnage SET level = $1 WHERE id = $2 AND user_id = $3`,
      [nextLevel, id, userId]
    );

    await client.query('COMMIT');
    return { success: true, newLevel: nextLevel };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

  /**
   * Renames a character. Only affects the row owned by the given user.
   *
   * @param {number} id
   * @param {number} userId
   * @param {string} newName
   * @returns {Promise<boolean>} True if renamed, false if not found/not owned.
   * @throws {Error} If newName is empty or whitespace-only.
   */
static async updateName(id, userId, newName) {
  if (!newName || !newName.trim()) {
    throw new Error('Le nom ne peut pas être vide');
  }
  const result = await db.query(
    `UPDATE personnage SET name = $1 WHERE id = $2 AND user_id = $3`,
    [newName.trim(), id, userId]
  );
  return result.rowCount > 0;
}
  /* ======================
     DELETE
  ====================== */
static async deleteById(id, userId) {
  const result = await db.query(
    `DELETE FROM personnage
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );

  return result.rowCount > 0;
}
}

module.exports = Character;