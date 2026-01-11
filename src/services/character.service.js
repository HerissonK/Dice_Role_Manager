const RuleValidator = require('./ruleValidator.service');
const { calculateModifier } = require('../utils/modifiers.util');

class CharacterService {

  static prepareCharacter(character) {
    RuleValidator.validateCharacter(character);

    const abilitiesWithModifiers = {};

    for (const [key, value] of Object.entries(character.abilities)) {
      abilitiesWithModifiers[key] = {
        value,
        modifier: calculateModifier(value)
      };
    }

    return {
      ...character,
      abilities: abilitiesWithModifiers
    };
  }
}

module.exports = CharacterService;
