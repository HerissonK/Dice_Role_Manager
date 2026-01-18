const db = require('../config/database');
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

}

module.exports = Character;
