const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'Reception123+',
  port: 5432,
});

async function test() {
  try {
    const res = await pool.query('SELECT * FROM characters');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

test();
