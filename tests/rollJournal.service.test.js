// Tests du composant d'accès aux données NoSQL (Redis) — RollJournalService.
//
// Comme pour les composants SQL de character.model.js, on mocke la couche
// de connexion (src/config/redis.js) pour tester la logique du service sans
// dépendre d'un vrai serveur Redis.

jest.mock('../src/config/redis', () => ({
  getRedisClient: jest.fn(),
}));

const { getRedisClient } = require('../src/config/redis');
const RollJournalService = require('../src/services/rollJournal.service');

function createFakeRedisClient() {
  return {
    lPush: jest.fn(),
    lTrim: jest.fn(),
    lRange: jest.fn(),
    del: jest.fn(),
  };
}

beforeEach(() => {
  getRedisClient.mockReset();
});

describe('RollJournalService.addRoll', () => {
  test('ajoute une entrée horodatée dans la liste Redis du personnage', async () => {
    const client = createFakeRedisClient();
    getRedisClient.mockResolvedValue(client);

    await RollJournalService.addRoll(1, { type: 'ability', total: 15 });

    expect(client.lPush).toHaveBeenCalledTimes(1);
    const [key, value] = client.lPush.mock.calls[0];
    expect(key).toBe('roll-journal:1');

    const parsed = JSON.parse(value);
    expect(parsed.type).toBe('ability');
    expect(parsed.total).toBe(15);
    expect(parsed.timestamp).toBeDefined();
  });

  test('tronque le journal à 50 entrées maximum après chaque ajout', async () => {
    const client = createFakeRedisClient();
    getRedisClient.mockResolvedValue(client);

    await RollJournalService.addRoll(1, { type: 'attack' });

    expect(client.lTrim).toHaveBeenCalledWith('roll-journal:1', 0, 49);
  });

  test("isole le journal de chaque personnage sous une clé distincte (pas de fuite entre personnages)", async () => {
    const client = createFakeRedisClient();
    getRedisClient.mockResolvedValue(client);

    await RollJournalService.addRoll(1, { type: 'ability' });
    await RollJournalService.addRoll(2, { type: 'ability' });

    const keys = client.lPush.mock.calls.map((call) => call[0]);
    expect(keys).toEqual(['roll-journal:1', 'roll-journal:2']);
  });
});

describe('RollJournalService.getRecentRolls', () => {
  test('retourne les entrées désérialisées, dans la limite demandée', async () => {
    const client = createFakeRedisClient();
    client.lRange.mockResolvedValue([
      JSON.stringify({ type: 'attack', total: 18 }),
      JSON.stringify({ type: 'ability', total: 12 }),
    ]);
    getRedisClient.mockResolvedValue(client);

    const rolls = await RollJournalService.getRecentRolls(1, 2);

    expect(client.lRange).toHaveBeenCalledWith('roll-journal:1', 0, 1);
    expect(rolls).toEqual([
      { type: 'attack', total: 18 },
      { type: 'ability', total: 12 },
    ]);
  });

  test('utilise une limite par défaut de 20 entrées si non précisée', async () => {
    const client = createFakeRedisClient();
    client.lRange.mockResolvedValue([]);
    getRedisClient.mockResolvedValue(client);

    await RollJournalService.getRecentRolls(1);

    expect(client.lRange).toHaveBeenCalledWith('roll-journal:1', 0, 19);
  });

  test("ne renvoie que le journal du personnage demandé, jamais celui d'un autre", async () => {
    const client = createFakeRedisClient();
    client.lRange.mockResolvedValue([]);
    getRedisClient.mockResolvedValue(client);

    await RollJournalService.getRecentRolls(42);

    const [key] = client.lRange.mock.calls[0];
    expect(key).toBe('roll-journal:42');
    expect(key).not.toBe('roll-journal:1');
  });
});

describe('RollJournalService.clearJournal', () => {
  test('supprime uniquement la clé Redis du personnage concerné', async () => {
    const client = createFakeRedisClient();
    getRedisClient.mockResolvedValue(client);

    await RollJournalService.clearJournal(1);

    expect(client.del).toHaveBeenCalledWith('roll-journal:1');
    expect(client.del).toHaveBeenCalledTimes(1);
  });
});