const db = require('../config/database');
const RuleValidator = require('../validators/ruleValidator');

class Character {

  /* ======================
     CREATE
     ✅ SAUVEGARDE LES COMPÉTENCES
  ====================== */
  static async create(data) {
    RuleValidator.validateCharacter(data);

    const {
      name,
      level,
      classId,
      speciesId,
      backgroundId,
      abilities,
      userId,
      skills // ✅ NOUVEAU: récupérer les compétences choisies
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
         (name, level, class_id, species_id, background_id, user_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [name, level, classId, speciesId, backgroundId, userId]
      );

      const characterId = result.rows[0].id;

      // 2. Sauvegarder les caractéristiques (SANS bonus raciaux)
      for (const [ability, value] of Object.entries(abilities)) {
        await client.query(
          `INSERT INTO personnage_caracteristique
           (personnage_id, caracteristique, valeur)
           VALUES ($1, $2, $3)`,
          [characterId, ability, value]
        );
      }

      // ✅ 3. NOUVEAU: Sauvegarder les compétences choisies
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
     ✅ RÉCUPÈRE SKILLS + APPLIQUE BONUS RACIAUX
  ====================== */
  static async findById(id, userId) {
    // 1. Récupérer les infos du personnage
    const characterResult = await db.query(
      `SELECT
        p.id,
        p.name,
        p.level,
        c.name AS class,
        c.hit_die,
        s.name AS species,
        s.ability_bonuses AS racial_bonuses, -- ✅ AJOUTÉ
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

    // 2. ✅ NOUVEAU: Récupérer les compétences de classe stockées
    const skillsResult = await db.query(
      `SELECT skill_name, source
       FROM personnage_skill
       WHERE personnage_id = $1`,
      [id]
    );
    
    const classSkills = skillsResult.rows
      .filter(r => r.source === 'class')
      .map(r => r.skill_name);
    
    // 3. Fusionner compétences background + classe
    const backgroundSkills = row.background_skills || [];
    const allSkills = [...new Set([...backgroundSkills, ...classSkills])];
    
    console.log('📋 Compétences background:', backgroundSkills);
    console.log('📋 Compétences classe:', classSkills);
    console.log('✅ Compétences totales:', allSkills);

    // 4. Caractéristiques de base (SANS bonus raciaux)
    const baseAbilities = {
      str: row.str ?? 10,
      dex: row.dex ?? 10,
      con: row.con ?? 10,
      int: row.int ?? 10,
      wis: row.wis ?? 10,
      cha: row.cha ?? 10
    };

    // 5. ✅ NOUVEAU: Appliquer les bonus raciaux
    const racialBonuses = row.racial_bonuses || {};
    const finalAbilities = { ...baseAbilities };
    
    for (const [ability, bonus] of Object.entries(racialBonuses)) {
      if (finalAbilities[ability] !== undefined && bonus) {
        finalAbilities[ability] += bonus;
      }
    }
    
    console.log('📊 Caractéristiques de base:', baseAbilities);
    console.log('📊 Bonus raciaux:', racialBonuses);
    console.log('✅ Caractéristiques finales:', finalAbilities);

    // 6. Calculer PV et CA avec les caractéristiques FINALES
    const conMod = Math.floor((finalAbilities.con - 10) / 2);
    const baseHit = row.hit_die;
    const level = row.level;

    const pv = Math.floor(
      baseHit + conMod + ((baseHit / 2) + 1 + conMod) * (level - 1)
    );

    const items = await this.getEquippedItems(row.id, userId);
    const armorClass = this.calculateArmorClass(finalAbilities, items);

    return {
      id: row.id,
      name: row.name,
      level: row.level,
      class: row.class,
      species: row.species,
      background: row.background,
      pv,
      armorClass,
      abilities: finalAbilities, // ✅ AVEC bonus raciaux appliqués
      skills: allSkills, // ✅ Background + Classe fusionnées
      items
    };
  }

  /* ======================
     FIND ALL (LIST)
     ✅ AVEC BONUS RACIAUX
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
        s.ability_bonuses AS racial_bonuses, -- ✅ AJOUTÉ
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

      // ✅ Appliquer bonus raciaux
      const racialBonuses = row.racial_bonuses || {};
      const finalAbilities = { ...baseAbilities };
      
      for (const [ability, bonus] of Object.entries(racialBonuses)) {
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
        background: row.background,
        pv,
        created_at: row.created_at
      };
    });
  }


  /* ======================
     EQUIPPED ITEMS
  ====================== */
  static async getEquippedItems(characterId, userId) {
    try {
      const result = await db.query(
        `SELECT
          i.id,
          i.name,
          i.category,
          i.armor_class,
          i.dex_modifier_rule,
          i.damage_dice,
          i.damage_type
        FROM personnage_item pi
        JOIN item i ON i.id = pi.item_id
        JOIN personnage p ON p.id = pi.personnage_id
        WHERE pi.personnage_id = $1
          AND pi.equipped = true
          AND p.user_id = $2`,
        [characterId, userId]
      );

      return result.rows;

    } catch (err) {
      console.error('getEquippedItems error:', err.message);
      return [];
    }
  }

  static calculateArmorClass(abilities, items) {
    const dexMod = Math.floor((abilities.dex - 10) / 2);

    let baseArmor = 10;
    let shieldBonus = 0;
    let dexRule = 'full';

    for (const item of items) {
      if (item.category.startsWith('armor')) {
        baseArmor = item.armor_class;
        dexRule = item.dex_modifier_rule;
      }

      if (item.category === 'shield') {
        shieldBonus += item.armor_class;
      }
    }

    let dexBonus = 0;

    if (dexRule === 'full') {
      dexBonus = dexMod;
    } else if (dexRule === 'max2') {
      dexBonus = Math.min(dexMod, 2);
    } // none => 0

    return baseArmor + dexBonus + shieldBonus;
  }


  /* ======================
     UPDATE
  ====================== */
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
             background_id = $5
         WHERE id = $6 AND user_id = $7`,
        [
          data.name,
          data.level,
          data.classId,
          data.speciesId,
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

  /* ======================
     DELETE
  ====================== */
  static async deleteById(id, userId) {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // Supprimer les compétences
      await client.query(
        `DELETE FROM personnage_skill
         WHERE personnage_id = $1`,
        [id]
      );

      // Supprimer les caractéristiques
      await client.query(
        `DELETE FROM personnage_caracteristique
         WHERE personnage_id = $1`,
        [id]
      );

      // Supprimer le personnage
      const result = await client.query(
        `DELETE FROM personnage
         WHERE id = $1 AND user_id = $2`,
        [id, userId]
      );

      await client.query('COMMIT');
      return result.rowCount > 0;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Character;