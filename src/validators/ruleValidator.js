/**
 * RuleValidator
 * Server-side validation of D&D 5e character creation rules.
 * All checks here are authoritative: the client-side calculations in
 * front-end/builder/builder.js are only a UX convenience and are never
 * trusted — every character is re-validated here before persistence.
 */
class RuleValidator {
  /**
   * Runs the full validation pipeline for a character creation payload.
   * Throws on the first rule violation encountered.
   * @param {Object} data - Raw character data sent by the client.
   * @throws {Error} If the payload is missing or any sub-validation fails.
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
   * Validates a character name (2 to 100 characters, non-empty string).
   * @param {string} name
   * @throws {Error} If the name is missing or out of the allowed length range.
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
   * Validates character level (must be an integer between 1 and 20).
   * @param {number} level
   * @throws {Error} If level is not an integer or out of range.
   */
  static validateLevel(level) {
    if (!Number.isInteger(level) || level < 1 || level > 20) {
      throw new Error('Level must be between 1 and 20');
    }
  }

  /**
   * Validates the six D&D ability scores (str, dex, con, int, wis, cha).
   * Each score must be present, an integer, and within the 8-15 range
   * allowed by the Point Buy system (before racial bonuses are applied).
   * @param {Object<string, number>} abilities
   * @throws {Error} If an ability is missing, non-integer, or out of range.
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
   * Converts a raw ability score into its D&D 5e modifier.
   * Formula: floor((score - 10) / 2).
   * @param {number} score - Final ability score (after racial bonuses).
   * @returns {number} The corresponding modifier.
   */
  static calculateModifier(score) {
    return Math.floor((score - 10) / 2);
  }

  /**
   * Applies calculateModifier() to every ability in the given set.
   * @param {Object<string, number>} abilities
   * @returns {Object<string, number>} Map of ability name to modifier.
   */
  static calculateAllModifiers(abilities) {
    const modifiers = {};

    for (const [key, value] of Object.entries(abilities)) {
      modifiers[key] = this.calculateModifier(value);
    }

    return modifiers;
  }

  /**
   * Re-validates the Point Buy budget server-side. The client (builder.js)
   * already prevents the user from overspending in the UI, but this method
   * guarantees that no request can bypass that rule by calling the API
   * directly with a tampered payload.
   * @param {Object<string, number>} abilities - Raw scores (8-15) before racial bonuses.
   * @throws {Error} If a score is outside the 8-15 range, or if the total
   *   cost exceeds the 27-point official D&D 5e Point Buy budget.
   */
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
