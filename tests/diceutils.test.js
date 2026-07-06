const { rollDice, abilityModifier } = require('../src/utils/dice');
const { calculateModifier } = require('../src/utils/modifiers.util');

describe('rollDice', () => {
  test('lance le bon nombre de dés', () => {
    const { rolls } = rollDice(3, 6);
    expect(rolls).toHaveLength(3);
  });

  test('chaque lancer reste dans les bornes du dé (1 à sides)', () => {
    const { rolls } = rollDice(50, 20);
    rolls.forEach((roll) => {
      expect(roll).toBeGreaterThanOrEqual(1);
      expect(roll).toBeLessThanOrEqual(20);
    });
  });

  test('le total correspond bien à la somme des lancers', () => {
    const { rolls, total } = rollDice(10, 6);
    const expectedTotal = rolls.reduce((sum, r) => sum + r, 0);
    expect(total).toBe(expectedTotal);
  });

  test('un lancer de 1 dé à 1 face donne toujours 1', () => {
    const { rolls, total } = rollDice(1, 1);
    expect(rolls).toEqual([1]);
    expect(total).toBe(1);
  });

  test('un lancer de 0 dé renvoie un tableau vide et un total de 0', () => {
    const { rolls, total } = rollDice(0, 20);
    expect(rolls).toEqual([]);
    expect(total).toBe(0);
  });
});

describe('abilityModifier (utils/dice.js)', () => {
  test.each([
    [1, -5],
    [8, -1],
    [9, -1],
    [10, 0],
    [11, 0],
    [12, 1],
    [20, 5],
    [30, 10],
  ])('score %i => modificateur %i', (score, expected) => {
    expect(abilityModifier(score)).toBe(expected);
  });
});

describe('calculateModifier (utils/modifiers.util.js)', () => {
  test.each([
    [8, -1],
    [10, 0],
    [13, 1],
    [15, 2],
  ])('score %i => modificateur %i', (score, expected) => {
    expect(calculateModifier(score)).toBe(expected);
  });

  test('reste cohérent avec RuleValidator.calculateModifier (même formule dupliquée)', () => {
    const RuleValidator = require('../src/validators/ruleValidator');
    for (let score = 8; score <= 20; score++) {
      expect(calculateModifier(score)).toBe(RuleValidator.calculateModifier(score));
    }
  });
});