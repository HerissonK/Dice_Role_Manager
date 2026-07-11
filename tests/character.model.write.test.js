// Tests de la couche d'accès aux données — écritures (create, update, delete)
//
// create() et updateById() utilisent une transaction (db.connect() -> client
// avec BEGIN/COMMIT/ROLLBACK), contrairement à findById() qui utilise
// db.query() directement. On mocke donc les deux à la fois.
//
// RuleValidator est mocké ici : sa logique de validation est déjà couverte
// en détail par rulevalidator.test.js. On veut isoler la logique propre à
// Character (construction des requêtes, gestion de la transaction, sécurité)
// de la logique de validation métier, pour ne pas dupliquer les mêmes tests.

jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));
jest.mock('../src/validators/ruleValidator');

const db = require('../src/config/database');
const RuleValidator = require('../src/validators/ruleValidator');
const Character = require('../src/models/character.model');

function createFakeClient() {
  return {
    query: jest.fn(),
    release: jest.fn(),
  };
}

const validCharacterData = {
  name: 'Dreevok',
  level: 1,
  classId: 6,
  speciesId: 2,
  backgroundId: 2,
  userId: 42,
  abilities: { str: 10, dex: 12, con: 13, int: 8, wis: 10, cha: 14 },
  skills: [],
  equipment: [],
};

beforeEach(() => {
  db.query.mockReset();
  db.connect.mockReset();
  RuleValidator.validateCharacter.mockReset();
  RuleValidator.validateCharacter.mockImplementation(() => {}); // valide par défaut
});

describe('Character.create — orchestration de la transaction', () => {
  test('déroule BEGIN, les insertions, puis COMMIT et libère le client (cas nominal)', async () => {
    const client = createFakeClient();
    db.connect.mockResolvedValue(client);

    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rows: [{ id: 7 }] }); // INSERT INTO personnage ... RETURNING id
    // 6 insertions de caractéristiques (str, dex, con, int, wis, cha)
    for (let i = 0; i < 6; i++) client.query.mockResolvedValueOnce({});
    client.query.mockResolvedValueOnce(undefined); // COMMIT

    const characterId = await Character.create(validCharacterData);

    expect(characterId).toBe(7);
    expect(client.query).toHaveBeenNthCalledWith(1, 'BEGIN');
    expect(client.query.mock.calls.at(-1)[0]).toBe('COMMIT');
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  test('valide les données via RuleValidator avant toute écriture en base', async () => {
    RuleValidator.validateCharacter.mockImplementation(() => {
      throw new Error('Character name is required');
    });

    await expect(Character.create(validCharacterData)).rejects.toThrow('Character name is required');

    // Aucune connexion à la base ne doit être ouverte si la validation échoue en amont.
    expect(db.connect).not.toHaveBeenCalled();
  });

  test('exécute un ROLLBACK et propage l\'erreur si une insertion échoue en cours de transaction', async () => {
    const client = createFakeClient();
    db.connect.mockResolvedValue(client);

    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockRejectedValueOnce(new Error('duplicate key value violates unique constraint')); // INSERT personnage échoue

    await expect(Character.create(validCharacterData)).rejects.toThrow(
      'duplicate key value violates unique constraint'
    );

    const calls = client.query.mock.calls.map((c) => c[0]);
    expect(calls).toContain('ROLLBACK');
    expect(calls).not.toContain('COMMIT');
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  test('insère la ligne personnage avec des paramètres positionnés, dans l\'ordre attendu', async () => {
    const client = createFakeClient();
    db.connect.mockResolvedValue(client);

    client.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rows: [{ id: 7 }] });
    for (let i = 0; i < 6; i++) client.query.mockResolvedValueOnce({});
    client.query.mockResolvedValueOnce(undefined);

    await Character.create(validCharacterData);

    const insertCall = client.query.mock.calls.find(([sql]) =>
      typeof sql === 'string' && sql.includes('INSERT INTO personnage')
    );
    const [sql, params] = insertCall;
    expect(sql).toMatch(/\$1.*\$2.*\$3.*\$4.*\$5.*\$6/s);
    expect(params).toEqual([
      validCharacterData.name,
      validCharacterData.level,
      validCharacterData.classId,
      validCharacterData.speciesId,
      validCharacterData.backgroundId,
      validCharacterData.userId,
    ]);
  });
});

describe('Character.create — compétences et équipement', () => {
  function mockHappyPathUpTo(client, extraQueryCount = 0) {
    client.query.mockResolvedValueOnce(undefined); // BEGIN
    client.query.mockResolvedValueOnce({ rows: [{ id: 7 }] }); // INSERT personnage
    for (let i = 0; i < 6; i++) client.query.mockResolvedValueOnce({}); // caractéristiques
  }

  test('enregistre chaque compétence choisie avec ON CONFLICT DO NOTHING', async () => {
    const client = createFakeClient();
    db.connect.mockResolvedValue(client);
    mockHappyPathUpTo(client);
    client.query.mockResolvedValueOnce({}); // INSERT skill 1
    client.query.mockResolvedValueOnce({}); // INSERT skill 2
    client.query.mockResolvedValueOnce(undefined); // COMMIT

    await Character.create({ ...validCharacterData, skills: ['Discrétion', 'Tromperie'] });

    const skillInserts = client.query.mock.calls.filter(
      ([sql]) => typeof sql === 'string' && sql.includes('INSERT INTO personnage_skill')
    );
    expect(skillInserts).toHaveLength(2);
    expect(skillInserts[0][0]).toMatch(/ON CONFLICT/);
  });

  test('associe un item déjà existant en base (recherche insensible à la casse/aux espaces)', async () => {
    const client = createFakeClient();
    db.connect.mockResolvedValue(client);
    mockHappyPathUpTo(client);
    client.query.mockResolvedValueOnce({ rows: [{ id: 99 }] }); // SELECT id FROM item ... trouvé
    client.query.mockResolvedValueOnce({}); // INSERT personnage_item
    client.query.mockResolvedValueOnce(undefined); // COMMIT

    await Character.create({
      ...validCharacterData,
      equipment: [{ name: 'Épée longue', damage_dice: '1d8' }],
    });

    const selectCall = client.query.mock.calls.find(([sql]) =>
      typeof sql === 'string' && sql.includes('SELECT id FROM item')
    );
    expect(selectCall[0]).toMatch(/LOWER\(TRIM\(name\)\)/);

    const linkCall = client.query.mock.calls.find(([sql]) =>
      typeof sql === 'string' && sql.includes('INSERT INTO personnage_item')
    );
    expect(linkCall[1]).toEqual([7, 99, ]); // characterId, itemId — le 3e paramètre (true) est en dur dans la requête
  });

  test('insère un nouvel item à la volée si aucune correspondance en base, puis le lie au personnage', async () => {
    const client = createFakeClient();
    db.connect.mockResolvedValue(client);
    mockHappyPathUpTo(client);
    client.query.mockResolvedValueOnce({ rows: [] }); // SELECT id FROM item -> rien trouvé
    client.query.mockResolvedValueOnce({ rows: [{ id: 123 }] }); // INSERT INTO item ... RETURNING id
    client.query.mockResolvedValueOnce({}); // INSERT personnage_item
    client.query.mockResolvedValueOnce(undefined); // COMMIT

    await Character.create({
      ...validCharacterData,
      equipment: [{ name: 'Fouet enchanté', damage_dice: '1d4', damage_type: 'slashing' }],
    });

    const insertItemCall = client.query.mock.calls.find(([sql]) =>
      typeof sql === 'string' && sql.includes('INSERT INTO item')
    );
    expect(insertItemCall[1][1]).toBe('weapon'); // catégorie déduite car damage_dice présent

    const linkCall = client.query.mock.calls.find(([sql]) =>
      typeof sql === 'string' && sql.includes('INSERT INTO personnage_item')
    );
    expect(linkCall[1][1]).toBe(123); // lié au nouvel item créé
  });

  test('ignore un item sans caractéristique de combat (ni dégâts, ni CA, ni catégorie)', async () => {
    const client = createFakeClient();
    db.connect.mockResolvedValue(client);
    mockHappyPathUpTo(client);
    client.query.mockResolvedValueOnce(undefined); // COMMIT directement, aucune requête item

    await Character.create({
      ...validCharacterData,
      equipment: [{ name: 'Corde 15m' }], // pas de damage_dice/damage/armor_class/category
    });

    const itemQueries = client.query.mock.calls.filter(
      ([sql]) =>
        typeof sql === 'string' &&
        (sql.includes('SELECT id FROM item') || sql.includes('INSERT INTO item') || sql.includes('personnage_item'))
    );
    expect(itemQueries).toHaveLength(0);
  });
});

describe('Character.updateById — sécurité et transaction', () => {
  test("refuse la mise à jour si le personnage n'appartient pas à l'utilisateur (rowCount = 0)", async () => {
    const client = createFakeClient();
    db.connect.mockResolvedValue(client);

    client.query
      .mockResolvedValueOnce(undefined) // BEGIN
      .mockResolvedValueOnce({ rowCount: 0 }); // UPDATE ... WHERE id=$6 AND user_id=$7 -> personne trouvée

    const updated = await Character.updateById(1, 999, validCharacterData);

    expect(updated).toBe(false);
    const calls = client.query.mock.calls.map((c) => c[0]);
    expect(calls).toContain('ROLLBACK');
    // Aucune mise à jour de caractéristique ne doit être tentée si l'UPDATE principal n'a rien affecté.
    expect(calls.some((sql) => typeof sql === 'string' && sql.includes('personnage_caracteristique'))).toBe(false);
  });

  test("l'UPDATE principal filtre sur id ET user_id (empêche de modifier le personnage d'un autre utilisateur)", async () => {
    const client = createFakeClient();
    db.connect.mockResolvedValue(client);

    client.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rowCount: 1 });
    for (let i = 0; i < 6; i++) client.query.mockResolvedValueOnce({});
    client.query.mockResolvedValueOnce(undefined);

    await Character.updateById(1, 42, validCharacterData);

    const updateCall = client.query.mock.calls.find(([sql]) =>
      typeof sql === 'string' && sql.trim().startsWith('UPDATE personnage')
    );
    const [sql, params] = updateCall;
    expect(sql).toMatch(/WHERE id = \$6 AND user_id = \$7/);
    expect(params).toEqual([
      validCharacterData.name,
      validCharacterData.level,
      validCharacterData.classId,
      validCharacterData.speciesId,
      validCharacterData.backgroundId,
      1,   // id
      42,  // userId
    ]);
  });

  test('valide un succès complet : caractéristiques mises à jour puis COMMIT', async () => {
    const client = createFakeClient();
    db.connect.mockResolvedValue(client);

    client.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rowCount: 1 });
    for (let i = 0; i < 6; i++) client.query.mockResolvedValueOnce({});
    client.query.mockResolvedValueOnce(undefined);

    const updated = await Character.updateById(1, 42, validCharacterData);

    expect(updated).toBe(true);
    expect(client.query.mock.calls.at(-1)[0]).toBe('COMMIT');
  });
});

describe('Character.updateName — validation et sécurité', () => {
  test('rejette un nom vide sans interroger la base', async () => {
    await expect(Character.updateName(1, 42, '')).rejects.toThrow('Le nom ne peut pas être vide');
    await expect(Character.updateName(1, 42, '   ')).rejects.toThrow('Le nom ne peut pas être vide');
    expect(db.query).not.toHaveBeenCalled();
  });

  test('rogne les espaces et met à jour uniquement le personnage de cet utilisateur', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const updated = await Character.updateName(1, 42, '  Dreevok le Vaillant  ');

    expect(updated).toBe(true);
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toMatch(/WHERE id = \$2 AND user_id = \$3/);
    expect(params).toEqual(['Dreevok le Vaillant', 1, 42]);
  });

  test("renvoie false si le personnage n'appartient pas à l'utilisateur", async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0 });

    const updated = await Character.updateName(1, 999, 'Nouveau nom');

    expect(updated).toBe(false);
  });
});

describe('Character.deleteById — sécurité', () => {
  test("supprime uniquement si le personnage appartient à l'utilisateur (id ET user_id)", async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const deleted = await Character.deleteById(1, 42);

    expect(deleted).toBe(true);
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toMatch(/WHERE id = \$1 AND user_id = \$2/);
    expect(params).toEqual([1, 42]);
  });

  test("renvoie false sans lever d'erreur si le personnage n'existe pas ou n'appartient pas à l'utilisateur", async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0 });

    const deleted = await Character.deleteById(1, 999);

    expect(deleted).toBe(false);
  });
});