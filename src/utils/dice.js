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

function abilityModifier(score) {
  return Math.floor((score - 10) / 2);
}

module.exports = {
  rollDice,
  abilityModifier
};
