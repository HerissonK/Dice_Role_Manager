const db = require('../config/database');
const pool = require('../config/database');
const RuleValidator = require('../validators/ruleValidator');

class Character {
  static async create(data) {
    RuleValidator.validateCharacter(data);

    const {
      name,
      level,
      classId,
      speciesId,
      backgroundId,
      abilities
    } = data;

    if (!name) {
      throw new Error('Character name is required');
    }

    const client = await db.connect();

    try {
      await client.query('BEGIN');

      const characterResult = await client.query(
        `INSERT INTO personnage (name, level, class_id, species_id, background_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [name, level, classId, speciesId, backgroundId]
      );

      const characterId = characterResult.rows[0].id;

      for (const [ability, value] of Object.entries(abilities)) {
        await client.query(
          `INSERT INTO personnage_caracteristique (personnage_id, caracteristique, valeur)
           VALUES ($1, $2, $3)`,
          [characterId, ability, value]
        );
      }

      await client.query('COMMIT');
      return characterId;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async findById(id) {
    const characterResult = await db.query(
      `SELECT id, name, level, class_id, species_id, background_id
       FROM personnage
       WHERE id = $1`,
      [id]
    );

    if (characterResult.rows.length === 0) {
      return null;
    }

    const character = characterResult.rows[0];

    const abilitiesResult = await db.query(
      `SELECT caracteristique, valeur
       FROM personnage_caracteristique
       WHERE personnage_id = $1`,
      [id]
    );

    const abilities = {};
    for (const row of abilitiesResult.rows) {
      abilities[row.caracteristique] = row.valeur;
    }

    return {
      id: character.id,
      name: character.name,
      level: character.level,
      classId: character.class_id,
      speciesId: character.species_id,
      backgroundId: character.background_id,
      abilities
    };
  }

  static async findAll() {
    const result = await db.query(
      'SELECT * FROM personnage ORDER BY id ASC'
    );
    return result.rows;
  }


  static async updateById(id, data) {
    RuleValidator.validateCharacter(data);
    const client = await db.connect();

    try {
      await client.query('BEGIN');

    // 1️⃣ Mettre à jour les infos du personnage
      await client.query(
        `UPDATE personnage
         SET name = $1,
             level = $2,
             class_id = $3,
             species_id = $4,
             background_id = $5
         WHERE id = $6`,
        [data.name, data.level, data.classId, data.speciesId, data.backgroundId, id]
      );

    // 2️⃣ Mettre à jour les abilities
      for (const [ability, value] of Object.entries(data.abilities)) {
        const exists = await client.query(
          `SELECT 1 FROM personnage_caracteristique
           WHERE personnage_id = $1 AND caracteristique = $2`,
          [id, ability]
        );

        if (exists.rows.length > 0) {
        // Update si existant
          await client.query(
            `UPDATE personnage_caracteristique
             SET valeur = $1
             WHERE personnage_id = $2 AND caracteristique = $3`,
            [value, id, ability]
          );
        } else {
        // Insert si pas existant
          await client.query(
            `INSERT INTO personnage_caracteristique (personnage_id, caracteristique, valeur)
             VALUES ($1, $2, $3)`,
            [id, ability, value]
          );
        }
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

  static async deleteById(id) {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

    // 1️⃣ Supprimer les caractéristiques associées
      await client.query(
        `DELETE FROM personnage_caracteristique
         WHERE personnage_id = $1`,
        [id]
      );
  
     // 2️⃣ Supprimer le personnage
      const result = await client.query(
        `DELETE FROM personnage
         WHERE id = $1`,
        [id]
      );

      await client.query('COMMIT');

    // Retourne true si au moins une ligne a été supprimée
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
