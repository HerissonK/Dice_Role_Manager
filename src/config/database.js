const { Pool } = require('pg');

const pool = new Pool({
  user: 'herissonk',
  host: 'localhost',
  database: 'dnd',
  password: 'Reception123+',
  port: 5432,
});

module.exports = pool;
