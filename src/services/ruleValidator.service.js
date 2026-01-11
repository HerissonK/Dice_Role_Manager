class RuleValidator {

  static validateLevel(level) {
    if (!Number.isInteger(level) || level < 1 || level > 20) {
      throw new Error('Level must be an integer between 1 and 20');
    }
  }

  static validateAbilities(abilities) {
    const REQUIRED_ABILITIES = [
      'str',
      'dex',
      'con',
      'int',
      'wis',
      'cha'
    ];

    for (const ability of REQUIRED_ABILITIES) {
      if (!(ability in abilities)) {
        throw new Error(`Missing ability: ${ability}`);
      }

      const value = abilities[ability];

      if (!Number.isInteger(value) || value < 1 || value > 20) {
        throw new Error(
          `Ability ${ability} must be an integer between 1 and 20`
        );
      }
    }
  }

  static validateCharacter(character) {
    this.validateLevel(character.level);
    this.validateAbilities(character.abilities);
  }
}

module.exports = RuleValidator;
