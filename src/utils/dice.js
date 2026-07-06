/**
 * Rolls `count` dice with `sides` faces each (e.g. rollDice(2, 6) = 2d6).
 * Resolved entirely server-side so results can never be forged by the client.
 * @param {number} count - Number of dice to roll.
 * @param {number} sides - Number of faces per die.
 * @returns {{rolls: number[], total: number}} Individual rolls and their sum.
 */
function rollDice(count, sides) {
  const rolls = [];
  let total = 0;

  for (let i = 0; i < count; i++) {
    const roll = Math.floor(Math.random() * sides) + 1;
    rolls.push(roll);
    total += roll;
  }

  return { rolls, total };
}

/**
 * Converts a raw ability score into its D&D 5e modifier.
 * @param {number} score
 * @returns {number} floor((score - 10) / 2)
 */
function abilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

module.exports = {
  rollDice,
  abilityModifier
};
