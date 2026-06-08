const { Pool, types } = require('pg');

// TIMESTAMP WITHOUT TIME ZONE columns store UTC wall-clock values (Postgres in Docker).
// Parse as UTC so Node hosts in other timezones (e.g. UTC+8) don't shift timestamps.
types.setTypeParser(1114, (value) => {
  if (value === null) return null;
  return new Date(`${String(value).replace(' ', 'T')}Z`);
});

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'community_response_hub',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (error) => {
  console.error('Unexpected error on idle PostgreSQL client', error);
});

async function query(text, params) {
  return pool.query(text, params);
}

module.exports = {
  pool,
  query,
};
