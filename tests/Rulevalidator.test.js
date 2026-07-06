const RuleValidator = require('../src/validators/ruleValidator');

describe('RuleValidator.validateName', () => {
  test('accepte un nom valide', () => {
    expect(() => RuleValidator.validateName('Dreevok')).not.toThrow();
  });

  test('rejette un nom vide', () => {
    expect(() => RuleValidator.validateName('')).toThrow('Character name is required');
  });

  test('rejette un nom absent (undefined)', () => {
    expect(() => RuleValidator.validateName(undefined)).toThrow('Character name is required');
  });

  test('rejette un nom trop court (1 caractère)', () => {
    expect(() => RuleValidator.validateName('D')).toThrow(
      'Character name must be between 2 and 100 characters'
    );
  });

  test('rejette un nom trop long (101 caractères)', () => {
    const longName = 'D'.repeat(101);
    expect(() => RuleValidator.validateName(longName)).toThrow(
      'Character name must be between 2 and 100 characters'
    );
  });

  test('accepte les bornes exactes (2 et 100 caractères)', () => {
    expect(() => RuleValidator.validateName('Dr')).not.toThrow();
    expect(() => RuleValidator.validateName('D'.repeat(100))).not.toThrow();
  });
});

describe('RuleValidator.validateLevel', () => {
  test('accepte un niveau valide', () => {
    expect(() => RuleValidator.validateLevel(1)).not.toThrow();
    expect(() => RuleValidator.validateLevel(20)).not.toThrow();
  });

  test('rejette un niveau à 0', () => {
    expect(() => RuleValidator.validateLevel(0)).toThrow('Level must be between 1 and 20');
  });

  test('rejette un niveau supérieur à 20', () => {
    expect(() => RuleValidator.validateLevel(21)).toThrow('Level must be between 1 and 20');
  });

  test('rejette un niveau non entier', () => {
    expect(() => RuleValidator.validateLevel(1.5)).toThrow('Level must be between 1 and 20');
  });
});

describe('RuleValidator.validateAbilities', () => {
  const validAbilities = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };

  test('accepte un jeu de caractéristiques complet et valide', () => {
    expect(() => RuleValidator.validateAbilities(validAbilities)).not.toThrow();
  });

  test('rejette une caractéristique manquante', () => {
    const { str, ...incomplete } = validAbilities;
    expect(() => RuleValidator.validateAbilities(incomplete)).toThrow('Missing ability: str');
  });

  test('rejette une valeur non entière', () => {
    expect(() =>
      RuleValidator.validateAbilities({ ...validAbilities, dex: 10.5 })
    ).toThrow('Ability dex must be an integer');
  });

  test('rejette une valeur sous le minimum (8)', () => {
    expect(() =>
      RuleValidator.validateAbilities({ ...validAbilities, con: 7 })
    ).toThrow('Ability con must be between 8 and 15');
  });

  test('rejette une valeur au-dessus du maximum (15)', () => {
    expect(() =>
      RuleValidator.validateAbilities({ ...validAbilities, cha: 16 })
    ).toThrow('Ability cha must be between 8 and 15');
  });
});

describe('RuleValidator.calculateModifier / calculateAllModifiers', () => {
  test.each([
    [8, -1],
    [10, 0],
    [11, 0],
    [12, 1],
    [15, 2],
    [20, 5],
  ])('score %i donne un modificateur %i', (score, expected) => {
    expect(RuleValidator.calculateModifier(score)).toBe(expected);
  });

  test('calcule les modificateurs pour un jeu complet de caractéristiques', () => {
    const abilities = { str: 8, dex: 14, con: 13, int: 10, wis: 10, cha: 15 };
    expect(RuleValidator.calculateAllModifiers(abilities)).toEqual({
      str: -1,
      dex: 2,
      con: 1,
      int: 0,
      wis: 0,
      cha: 2,
    });
  });
});

describe('RuleValidator.validatePointBuy', () => {
  test('accepte une répartition dans le budget de 27 points (cas du dossier RNCP)', () => {
    // FOR 10 (2) + DEX 12 (4) + CON 13 (5) + INT 8 (0) + SAG 10 (2) + CHA 14 (7) = 20 pts
    const abilities = { str: 10, dex: 12, con: 13, int: 8, wis: 10, cha: 14 };
    expect(() => RuleValidator.validatePointBuy(abilities)).not.toThrow();
  });

  test('accepte une répartition consommant exactement le budget de 27 points', () => {
    // 15(9) + 15(9) + 15(9) + 8(0) + 8(0) + 8(0) = 27 points exactement
    const abilities = { str: 15, dex: 15, con: 15, int: 8, wis: 8, cha: 8 };
    expect(() => RuleValidator.validatePointBuy(abilities)).not.toThrow();
  });

  test('rejette un score hors table (ex: 7, sous le minimum)', () => {
    const abilities = { str: 7, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    expect(() => RuleValidator.validatePointBuy(abilities)).toThrow(/invalide pour le Point Buy/);
  });

  test('rejette un dépassement du budget de 27 points', () => {
    // 15+15+15+15+15+15 = 9*6 = 54 pts, très au-dessus du budget
    const abilities = { str: 15, dex: 15, con: 15, int: 15, wis: 15, cha: 15 };
    expect(() => RuleValidator.validatePointBuy(abilities)).toThrow(/dépasse le budget/);
  });
});

describe('RuleValidator.validateCharacter (validation globale)', () => {
  test('valide un personnage complet et cohérent', () => {
    const data = {
      name: 'Dreevok',
      level: 1,
      abilities: { str: 10, dex: 12, con: 13, int: 8, wis: 10, cha: 14 },
    };
    expect(() => RuleValidator.validateCharacter(data)).not.toThrow();
  });

  test('rejette un payload absent', () => {
    expect(() => RuleValidator.validateCharacter(null)).toThrow('Character data is required');
  });

  test('propage l\'erreur du premier sous-validateur en échec (nom manquant)', () => {
    const data = { level: 1, abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } };
    expect(() => RuleValidator.validateCharacter(data)).toThrow('Character name is required');
  });
});