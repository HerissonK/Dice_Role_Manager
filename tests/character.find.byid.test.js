// Tests de la couche d'accès aux données — Character.findById() & getEquippedItems()
//
// findById() enchaîne 3 requêtes SQL réelles (personnage+jointures, compétences,
// puis getEquippedItems() en interne). On mocke db.query() et on empile les
// réponses dans l'ordre exact où le code les appelle.

jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

const db = require('../src/config/database');
const Character = require('../src/models/character.model');

function buildCharacterRow(overrides = {}) {
  return {
    id: 1,
    name: 'Dreevok',
    level: 1,
    class: 'Paladin',
    hit_die: 10,
    species: 'Elfe',
    racial_bonuses: { dex: 2 },
    background: 'Criminel',
    background_skills: ['Discrétion', 'Tromperie'],
    str: 10,
    dex: 12,
    con: 13,
    int: 8,
    wis: 10,
    cha: 14,
    ...overrides,
  };
}

// Empile les 3 réponses attendues par findById(), dans l'ordre :
// 1) requête personnage, 2) requête compétences, 3) requête items équipés
// (appelée en interne par getEquippedItems()).
function mockFindByIdQueries({ characterRow, skillsRows = [], itemsRows = [] }) {
  db.query
    .mockResolvedValueOnce({ rows: characterRow ? [characterRow] : [] })
    .mockResolvedValueOnce({ rows: skillsRows })
    .mockResolvedValueOnce({ rows: itemsRows });
}

beforeEach(() => {
  db.query.mockReset();
  db.connect.mockReset();
});

describe('Character.findById — requête principale (tests unitaires et de sécurité)', () => {
  test('interroge la base avec une requête paramétrée, jamais par concaténation', async () => {
    mockFindByIdQueries({ characterRow: buildCharacterRow() });

    await Character.findById(1, 42);

    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toMatch(/\$1/);
    expect(sql).toMatch(/\$2/);
    expect(params).toEqual([1, 42]);
  });

  test("filtre systématiquement sur p.id ET p.user_id (empêche l'accès au personnage d'un autre utilisateur)", async () => {
    mockFindByIdQueries({ characterRow: buildCharacterRow() });

    await Character.findById(1, 42);

    const [sql] = db.query.mock.calls[0];
    expect(sql).toMatch(/p\.id\s*=\s*\$1/);
    expect(sql).toMatch(/p\.user_id\s*=\s*\$2/);
  });

  test('renvoie null quand le personnage n\'existe pas ou n\'appartient pas à cet utilisateur', async () => {
    mockFindByIdQueries({ characterRow: null });

    const character = await Character.findById(999, 42);

    expect(character).toBeNull();
    // Aucune requête supplémentaire (compétences, items) ne doit être exécutée
    // si le personnage n'a pas été trouvé — sinon on interroge la base pour rien.
    expect(db.query).toHaveBeenCalledTimes(1);
  });
});

describe('Character.findById — fusion des bonus raciaux JSONB', () => {
  test('applique le bonus racial à la caractéristique concernée (cas Elfe, dossier RNCP)', async () => {
    mockFindByIdQueries({ characterRow: buildCharacterRow({ racial_bonuses: { dex: 2 }, dex: 12 }) });

    const character = await Character.findById(1, 42);

    expect(character.abilities.dex).toBe(14);
  });

  test('cumule plusieurs bonus raciaux simultanés (cas Nain : con +2, wis +1)', async () => {
    mockFindByIdQueries({
      characterRow: buildCharacterRow({ racial_bonuses: { con: 2, wis: 1 }, con: 13, wis: 10 }),
    });

    const character = await Character.findById(1, 42);

    expect(character.abilities.con).toBe(15);
    expect(character.abilities.wis).toBe(11);
  });

  test('ne modifie aucune caractéristique quand racial_bonuses est vide (Humain sans bonus fixe)', async () => {
    mockFindByIdQueries({
      characterRow: buildCharacterRow({
        racial_bonuses: {},
        str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
      }),
    });

    const character = await Character.findById(1, 42);

    expect(character.abilities).toEqual({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
  });

  test('reste robuste si racial_bonuses est null', async () => {
    mockFindByIdQueries({ characterRow: buildCharacterRow({ racial_bonuses: null }) });

    await expect(Character.findById(1, 42)).resolves.not.toThrow();
  });

  test('utilise 10 comme valeur par défaut si une caractéristique de base est absente (NULL en base)', async () => {
    mockFindByIdQueries({
      characterRow: buildCharacterRow({ str: null, racial_bonuses: {} }),
    });

    const character = await Character.findById(1, 42);

    expect(character.abilities.str).toBe(10);
  });
});

describe('Character.findById — calcul des PV et de la CA', () => {
  test('reproduit le cas nominal du dossier RNCP (Dreevok : Paladin, CON finale 13, niveau 1)', async () => {
    // hit_die 10, CON finale 13 (mod +1), niveau 1 => PV = 10 + 1 = 11
    mockFindByIdQueries({
      characterRow: buildCharacterRow(), // con: 13, pas de bonus racial sur CON
      itemsRows: [{ id: 1, name: 'Armure de cuir', category: 'armor', armor_class: 11, dex_modifier_rule: 'full' }],
    });

    const character = await Character.findById(1, 42);

    expect(character.pv).toBe(11);
    // DEX finale 14 (12 + bonus racial elfe +2), armure de cuir dex_modifier_rule 'full'
    expect(character.armorClass).toBe(13); // 11 + 2 (mod DEX)
  });

  test('sans équipement, la CA retombe sur 10 + modificateur DEX', async () => {
    mockFindByIdQueries({
      characterRow: buildCharacterRow({ dex: 10, racial_bonuses: {} }),
      itemsRows: [],
    });

    const character = await Character.findById(1, 42);

    expect(character.armorClass).toBe(10);
  });
});

describe('Character.findById — fusion des compétences (background + classe)', () => {
  test('fusionne les compétences d\'historique et de classe sans doublon', async () => {
    mockFindByIdQueries({
      characterRow: buildCharacterRow({ background_skills: ['Discrétion', 'Tromperie'] }),
      skillsRows: [
        { skill_name: 'Discrétion', source: 'class' }, // doublon volontaire avec le background
        { skill_name: 'Perception', source: 'class' },
        { skill_name: 'Religion', source: 'background' }, // ne doit pas être compté (source != 'class')
      ],
    });

    const character = await Character.findById(1, 42);

    expect(character.skills.sort()).toEqual(['Discrétion', 'Perception', 'Tromperie'].sort());
  });
});

describe('Character.getEquippedItems — sécurité et filtrage', () => {
  test('filtre sur personnage_id, equipped=true ET p.user_id (empêche de récupérer les items d\'un personnage qui n\'appartient pas à l\'utilisateur)', async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    await Character.getEquippedItems(1, 42);

    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toMatch(/pi\.equipped\s*=\s*true/);
    expect(sql).toMatch(/p\.user_id\s*=\s*\$2/);
    expect(params).toEqual([1, 42]);
  });
});

describe('Character.findAllByUser — sécurité et calculs', () => {
  test("ne renvoie que les personnages appartenant à l'utilisateur demandé", async () => {
    db.query.mockResolvedValueOnce({ rows: [] });

    await Character.findAllByUser(42);

    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toMatch(/p\.user_id\s*=\s*\$1/);
    expect(params).toEqual([42]);
  });

  test('applique les bonus raciaux et calcule les PV pour chaque personnage de la liste', async () => {
    db.query.mockResolvedValueOnce({
      rows: [
        buildCharacterRow({ id: 1, name: 'Dreevok', racial_bonuses: { dex: 2 }, con: 13 }),
        buildCharacterRow({ id: 2, name: 'Yugz', racial_bonuses: {}, con: 10, hit_die: 8 }),
      ],
    });

    const characters = await Character.findAllByUser(42);

    expect(characters).toHaveLength(2);
    expect(characters[0].pv).toBe(11); // hit_die 10 + mod CON +1
    expect(characters[1].pv).toBe(8);  // hit_die 8 + mod CON 0
  });
});