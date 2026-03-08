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
    this.validatePointBuy(data.abilities);
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

      if (value < 8 || value > 15) {
        throw new Error(`Ability ${key} must be between 8 and 15`);
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

  static validatePointBuy(abilities) {
    const costs = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
    let total = 0;

    for (const [key, value] of Object.entries(abilities)) {
      if (!(value in costs)) {
        throw new Error(`Score ${key}=${value} invalide pour le Point Buy (8-15 autorisés avant bonus raciaux)`);
      }
      total += costs[value];
    }

    if (total > 27) {
      throw new Error(`Point Buy dépasse le budget (${total}/27 points utilisés)`);
    }
  }

}

module.exports = RuleValidator;
