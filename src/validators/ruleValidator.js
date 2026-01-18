class RuleValidator {
  static validateCharacter(data) {
    this.validateLevel(data.level);
    this.validateAbilities(data.abilities);
  }

  static validateLevel(level) {
    if (!Number.isInteger(level) || level < 1 || level > 20) {
      throw new Error('Level must be between 1 and 20');
    }
  }

  static validateAbilities(abilities) {
    const keys = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

    for (const key of keys) {
      const value = abilities[key];

      if (value === undefined) {
        throw new Error(`Missing ability: ${key}`);
      }

      if (!Number.isInteger(value) || value < 1 || value > 20) {
        throw new Error(`Ability ${key} must be between 1 and 20`);
      }
    }
  }
}

module.exports = RuleValidator;
