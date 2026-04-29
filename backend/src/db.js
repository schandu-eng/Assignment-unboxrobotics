const { Pool } = require('pg');

function createPool() {
  const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: Number(process.env.PGPORT || 5432),
    user: process.env.PGUSER || 'speedometer',
    password: process.env.PGPASSWORD || 'speedometer',
    database: process.env.PGDATABASE || 'speedometer',
    // The simulator runs forever; keep connections healthy.
    max: 10,
    idleTimeoutMillis: 30_000,
  });

  return pool;
}

async function waitForDb(pool, { retries = 10, baseDelayMs = 250 } = {}) {
  let lastErr;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      lastErr = err;
      const delay = baseDelayMs * attempt * attempt;
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw lastErr;
}

async function insertReading(pool, speedKmph) {
  // recorded_at has default NOW() in the schema.
  const result = await pool.query(
    'INSERT INTO speed_readings (speed_kmph) VALUES ($1) RETURNING id',
    [speedKmph],
  );
  return result.rows[0].id;
}

async function getLatestReading(pool) {
  const result = await pool.query(
    `SELECT id, speed_kmph, recorded_at
     FROM speed_readings
     ORDER BY recorded_at DESC
     LIMIT 1`,
  );

  if (result.rows.length === 0) return null;
  const row = result.rows[0];
  return {
    id: row.id,
    speedKmph: Number.parseFloat(row.speed_kmph),
    recordedAt: row.recorded_at.toISOString(),
  };
}

async function getHistory(pool, limit) {
  const result = await pool.query(
    `SELECT id, speed_kmph, recorded_at
     FROM speed_readings
     ORDER BY recorded_at DESC
     LIMIT $1`,
    [limit],
  );

  const rows = result.rows;
  rows.reverse(); // oldest -> newest for left-to-right chart.

  return rows.map((row) => ({
    id: row.id,
    speedKmph: Number.parseFloat(row.speed_kmph),
    recordedAt: row.recorded_at.toISOString(),
  }));
}

module.exports = {
  createPool,
  waitForDb,
  insertReading,
  getLatestReading,
  getHistory,
};

