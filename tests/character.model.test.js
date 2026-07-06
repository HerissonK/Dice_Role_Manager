const Character = require('../src/models/character.model');

// Character.calculateArmorClass est une méthode statique pure : elle ne touche
// pas à la base de données, elle peut donc être testée directement sans mock.

describe('Character.calculateArmorClass', () => {
  test('sans armure ni bouclier : CA = 10 + modificateur DEX', () => {
    const abilities = { dex: 14 }; // mod DEX = +2
    const ca = Character.calculateArmorClass(abilities, []);
    expect(ca).toBe(12);
  });

  test('sans armure, avec DEX négative : CA peut descendre sous 10', () => {
    const abilities = { dex: 6 }; // mod DEX = -2
    const ca = Character.calculateArmorClass(abilities, []);
    expect(ca).toBe(8);
  });

  test('armure légère (dex_modifier_rule = full) applique tout le modificateur DEX', () => {
    const abilities = { dex: 14 }; // mod DEX = +2
    const items = [{ category: 'armor-light', armor_class: 11, dex_modifier_rule: 'full' }];
    const ca = Character.calculateArmorClass(abilities, items);
    expect(ca).toBe(13); // 11 + 2
  });

  test("armure moyenne (dex_modifier_rule = max2) plafonne le bonus DEX à +2", () => {
    const abilities = { dex: 18 }; // mod DEX = +4, mais plafonné à +2
    const items = [{ category: 'armor-medium', armor_class: 13, dex_modifier_rule: 'max2' }];
    const ca = Character.calculateArmorClass(abilities, items);
    expect(ca).toBe(15); // 13 + 2 (plafonné)
  });

  test('armure lourde (dex_modifier_rule = none) ignore totalement le modificateur DEX', () => {
    const abilities = { dex: 18 }; // mod DEX = +4, ignoré
    const items = [{ category: 'armor-heavy', armor_class: 16, dex_modifier_rule: 'none' }];
    const ca = Character.calculateArmorClass(abilities, items);
    expect(ca).toBe(16); // 16 + 0
  });

  test('un bouclier ajoute son bonus (2 par défaut) à la CA de base', () => {
    const abilities = { dex: 10 }; // mod DEX = 0
    const items = [{ category: 'shield' }];
    const ca = Character.calculateArmorClass(abilities, items);
    expect(ca).toBe(12); // 10 + 0 + 2
  });

  test('un bouclier avec bonus explicite (armor_class renseigné) est respecté', () => {
    const abilities = { dex: 10 };
    const items = [{ category: 'shield', armor_class: 3 }];
    const ca = Character.calculateArmorClass(abilities, items);
    expect(ca).toBe(13); // 10 + 0 + 3
  });

  test('armure + bouclier combinés : les deux bonus s\'additionnent', () => {
    const abilities = { dex: 14 }; // mod DEX = +2
    const items = [
      { category: 'armor-light', armor_class: 11, dex_modifier_rule: 'full' },
      { category: 'shield' },
    ];
    const ca = Character.calculateArmorClass(abilities, items);
    expect(ca).toBe(15); // 11 + 2 (dex) + 2 (bouclier)
  });

  test('reproduit le cas nominal du dossier RNCP (Dreevok : armure de cuir, DEX finale 14)', () => {
    // Cas décrit dans le dossier : armure de cuir (CA base 11, DEX complet), DEX finale 14 (mod +2)
    const abilities = { dex: 14 };
    const items = [{ category: 'armor', armor_class: 11, dex_modifier_rule: 'full' }];
    const ca = Character.calculateArmorClass(abilities, items);
    expect(ca).toBe(13); // conforme au jeu d'essai du dossier (CA = 13)
  });
});