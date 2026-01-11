function calculateModifier(score) {
  return Math.floor((score - 10) / 2);
}

module.exports = {
  calculateModifier
};
