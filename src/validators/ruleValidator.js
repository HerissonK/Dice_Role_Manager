/**
 * RuleValidator
 * Validation des règles de création de personnage D&D 5e
 */
class RuleValidator {
  /**
   * Validation globale d'un personnage
   * @param {Object} data
   */
  static validateCharacter(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('Character data is required');
    }

    this.validateName(data.name);
    this.validateLevel(data.level);
    this.validateAbilities(data.abilities);
  }

  /**
   * Validation du nom du personnage
   * @param {string} name
   */
  static validateName(name) {
    if (!name || typeof name !== 'string') {
      throw new Error('Character name is required');
    }

    if (name.length < 2 || name.length > 100) {
      throw new Error('Character name must be between 2 and 100 characters');
    }
  }

  /**
   * Validation du niveau (1 à 20)
   * @param {number} level
   */
  static validateLevel(level) {
    if (!Number.isInteger(level) || level < 1 || level > 20) {
      throw new Error('Level must be between 1 and 20');
    }
  }

  /**
   * Validation des caractéristiques D&D
   * @param {Object} abilities
   */
  static validateAbilities(abilities) {
    if (!abilities || typeof abilities !== 'object') {
      throw new Error('Abilities are required');
    }

    const keys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

    for (const key of keys) {
      const value = abilities[key];

      if (value === undefined) {
        throw new Error(`Missing ability: ${key}`);
      }

      if (!Number.isInteger(value)) {
        throw new Error(`Ability ${key} must be an integer`);
      }

      if (value < 1 || value > 20) {
        throw new Error(`Ability ${key} must be between 1 and 20`);
      }
    }
  }

  /**
   * Calcul des modificateurs D&D
   * @param {number} score
   * @returns {number}
   */
  static calculateModifier(score) {
    return Math.floor((score - 10) / 2);
  }

  /**
   * Calcul de tous les modificateurs
   * @param {Object} abilities
   * @returns {Object}
   */
  static calculateAllModifiers(abilities) {
    const modifiers = {};

    for (const [key, value] of Object.entries(abilities)) {
      modifiers[key] = this.calculateModifier(value);
    }

    return modifiers;
  }
}

module.exports = RuleValidator;
