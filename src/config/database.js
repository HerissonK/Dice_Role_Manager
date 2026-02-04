require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'herissonk',
  password: process.env.DB_PASSWORD || 'Reception123+',
  database: process.env.DB_NAME || 'dnd',
});

// Gestion des erreurs du pool
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

module.exports = pool;