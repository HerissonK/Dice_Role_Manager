/**
 * Computes the D&D 5e proficiency bonus for a given character level.
 *
 * Official progression: +2 at levels 1-4, +3 at 5-8, +4 at 9-12,
 * +5 at 13-16, +6 at 17-20.
 *
 * This replaces the `const proficiencyBonus = 2;` previously hardcoded in
 * several places (play.controller.js, front-end play.js, builder.js) —
 * harmless while every test character was level 1, but incorrect for any
 * other level.
 *
 * @param {number} level - Character level (1-20).
 * @returns {number} The proficiency bonus.
 */
function getProficiencyBonus(level) {
  if (!Number.isInteger(level) || level < 1) {
    throw new Error(`Invalid character level: ${level}`);
  }
  return Math.floor((level - 1) / 4) + 2;
}

module.exports = { getProficiencyBonus };