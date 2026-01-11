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

    const result = await db.query(
      `INSERT INTO personnage (name, level, class_id, species_id, background_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [name, level, classId, speciesId, backgroundId]
    );

    const characterId = result.rows[0].id;

    for (const [ability, value] of Object.entries(abilities)) {
      await db.query(
        `INSERT INTO personnage_caracteristique (personnage_id, caracteristique, valeur)
         VALUES ($1, $2, $3)`,
        [characterId, ability, value]
      );
    }

    return characterId;
  }
}

module.exports = Character;
