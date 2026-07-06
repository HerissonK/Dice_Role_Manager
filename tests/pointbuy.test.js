// Ces tests couvrent la logique Point Buy du builder front-end, qui est
// exécutée en Vanilla JS dans le navigateur (pas de framework, pas de bundler).
//
// builder.js exécute `document.addEventListener('DOMContentLoaded', ...)` au
// chargement du fichier : on stub donc un `document` minimal avant l'import,
// uniquement pour permettre le chargement du module sous Node/Jest. Cela ne
// modifie en rien le comportement réel de l'application dans le navigateur.
global.document = global.document || { addEventListener: () => {} };

const { pointBuyCosts } = require('../front-end/support/dndData.js');
global.pointBuyCosts = pointBuyCosts;

const {
  calculatePointsUsed,
  canIncrease,
  canDecrease,
  MIN_SCORE,
  MAX_SCORE,
} = require('../front-end/builder/builder.js');

describe('calculatePointsUsed', () => {
  test('un jeu de scores tous au minimum (8) coûte 0 point', () => {
    const scores = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
    expect(calculatePointsUsed(scores)).toBe(0);
  });

  test('reproduit le cas nominal du dossier RNCP (Dreevok, 20 points dépensés)', () => {
    const scores = { str: 10, dex: 12, con: 13, int: 8, wis: 10, cha: 14 };
    expect(calculatePointsUsed(scores)).toBe(20);
  });

  test('un jeu de scores tous au maximum (15) coûte 54 points (9 x 6)', () => {
    const scores = { str: 15, dex: 15, con: 15, int: 15, wis: 15, cha: 15 };
    expect(calculatePointsUsed(scores)).toBe(54);
  });
});

describe('canIncrease', () => {
  test('autorise une augmentation si assez de points restants', () => {
    const scores = { str: 10 };
    // 10 -> 11 coûte 1 point (3-2), il reste largement assez
    expect(canIncrease('str', scores, 27)).toBe(true);
  });

  test('refuse une augmentation si le score est déjà au maximum (15)', () => {
    const scores = { str: MAX_SCORE };
    expect(canIncrease('str', scores, 27)).toBe(false);
  });

  test('refuse une augmentation si le coût marginal dépasse les points restants', () => {
    // passer de 14 à 15 coûte 2 points (9-7)
    const scores = { str: 14 };
    expect(canIncrease('str', scores, 1)).toBe(false);
    expect(canIncrease('str', scores, 2)).toBe(true);
  });
});

describe('canDecrease', () => {
  test('autorise une diminution si le score est au-dessus du minimum', () => {
    const scores = { str: 10 };
    expect(canDecrease('str', scores)).toBe(true);
  });

  test('refuse une diminution si le score est déjà au minimum (8)', () => {
    const scores = { str: MIN_SCORE };
    expect(canDecrease('str', scores)).toBe(false);
  });
});

describe('Cohérence globale du système Point Buy', () => {
  test('le budget de 27 points ne peut jamais être dépassé via des augmentations successives autorisées', () => {
    const scores = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
    let pointsRemaining = 27;

    // On tente d'augmenter "str" tant que canIncrease l'autorise
    while (canIncrease('str', scores, pointsRemaining) && scores.str < MAX_SCORE) {
      const cost = pointBuyCosts[scores.str + 1] - pointBuyCosts[scores.str];
      scores.str += 1;
      pointsRemaining -= cost;
    }

    expect(scores.str).toBeLessThanOrEqual(MAX_SCORE);
    expect(pointsRemaining).toBeGreaterThanOrEqual(0);
    expect(calculatePointsUsed(scores)).toBe(27 - pointsRemaining);
  });
});