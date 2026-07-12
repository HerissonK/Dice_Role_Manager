const { getRedisClient } = require('../config/redis');

// Nombre maximum d'entrées conservées par personnage — le journal est une
// donnée volatile et à courte durée de vie, pas un historique permanent.
const MAX_JOURNAL_ENTRIES = 50;

const journalKey = (characterId) => `roll-journal:${characterId}`;

/**
 * Composant d'accès aux données NoSQL (Redis, clé-valeur) pour le journal
 * des lancers de dés. Contrairement à character.model.js (PostgreSQL,
 * données structurées et relationnelles), ce composant gère une donnée
 * volatile, propre à une session de jeu, pour laquelle un store clé-valeur
 * est plus adapté qu'une table relationnelle (voir section 12 du dossier).
 *
 * Sécurité : ce service ne fait aucune vérification d'autorisation lui-même
 * — l'appelant (play.controller.js) doit systématiquement vérifier que le
 * personnage appartient bien à l'utilisateur (via Character.findById) AVANT
 * d'appeler une méthode de ce service, exactement comme pour les composants
 * SQL de character.model.js.
 */
class RollJournalService {
  /**
   * Adds a roll entry to a character's journal, keeping only the most
   * recent MAX_JOURNAL_ENTRIES entries.
   *
   * @param {number} characterId
   * @param {object} rollData - Arbitrary roll result data to store.
   * @returns {Promise<void>}
   */
  static async addRoll(characterId, rollData) {
    const client = await getRedisClient();
    const entry = JSON.stringify({ ...rollData, timestamp: new Date().toISOString() });

    await client.lPush(journalKey(characterId), entry);
    await client.lTrim(journalKey(characterId), 0, MAX_JOURNAL_ENTRIES - 1);
  }

  /**
   * Returns the most recent roll entries for a character, newest first.
   *
   * @param {number} characterId
   * @param {number} [limit=20]
   * @returns {Promise<object[]>}
   */
  static async getRecentRolls(characterId, limit = 20) {
    const client = await getRedisClient();
    const entries = await client.lRange(journalKey(characterId), 0, limit - 1);
    return entries.map((entry) => JSON.parse(entry));
  }

  /**
   * Clears a character's roll journal entirely.
   *
   * @param {number} characterId
   * @returns {Promise<void>}
   */
  static async clearJournal(characterId) {
    const client = await getRedisClient();
    await client.del(journalKey(characterId));
  }
}

module.exports = RollJournalService;