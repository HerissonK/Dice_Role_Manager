const db = require('../config/database');
const RuleValidator = require('../validators/ruleValidator');

class Character {

  /* ======================
     CREATE
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
      userId
    } = data;

    if (!name) {
      throw new Error('Character name is required');
    }

    const client = await db.connect();

    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO personnage
         (name, level, class_id, species_id, background_id, user_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [name, level, classId, speciesId, backgroundId, userId]
      );

      const characterId = result.rows[0].id;

      for (const [ability, value] of Object.entries(abilities)) {
        await client.query(
          `INSERT INTO personnage_caracteristique
           (personnage_id, caracteristique, valeur)
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

  /* ======================
     FIND ONE (DETAIL)
  ====================== */
  static async findById(id, userId) {
    const characterResult = await db.query(
      `SELECT
        p.id,
        p.name,
        p.level,
        c.name AS class,
        e.name AS species,
        b.name AS background
      FROM personnage p
      JOIN classe c ON c.id = p.class_id
      JOIN espece e ON e.id = p.species_id
      JOIN background b ON b.id = p.background_id
      WHERE p.id = $1 AND p.user_id = $2`,
      [id, userId]
    );

    if (!characterResult.rows.length) return null;

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
      ...character,
      abilities
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
        c.name AS class,
        e.name AS species,
        b.name AS background
      FROM personnage p
      JOIN classe c ON c.id = p.class_id
      JOIN espece e ON e.id = p.species_id
      JOIN background b ON b.id = p.background_id
      WHERE p.user_id = $1
      ORDER BY p.id DESC`,
      [userId]
    );

    return result.rows;
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

      await client.query(
        `DELETE FROM personnage_caracteristique
         WHERE personnage_id = $1`,
        [id]
      );

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
