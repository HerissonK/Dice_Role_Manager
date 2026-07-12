const { createClient } = require('redis');

// URL de connexion Redis, configurable via variable d'environnement.
// En local via docker-compose : redis://localhost:6379 (valeur par défaut).
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

redisClient.on('error', (err) => {
  console.error('Redis client error:', err.message);
});

let isConnected = false;

/**
 * Returns a connected Redis client, connecting lazily on first use.
 * Reused across calls to avoid opening a new connection per request.
 *
 * @returns {Promise<import('redis').RedisClientType>}
 */
async function getRedisClient() {
  if (!isConnected) {
    await redisClient.connect();
    isConnected = true;
  }
  return redisClient;
}

module.exports = { redisClient, getRedisClient };