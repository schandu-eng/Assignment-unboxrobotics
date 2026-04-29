require('dotenv').config();

const { createPool, waitForDb } = require('./db');
const { createServer } = require('./server');
const { startSimulator } = require('./simulator');

async function main() {
  const pool = createPool();
  await waitForDb(pool);

  const app = createServer({ pool });
  const port = Number(process.env.PORT || 4000);
  const host = process.env.HOST || '0.0.0.0';

  const server = app.listen(port, host, () => {
    console.log(`Speedometer API listening on http://${host}:${port}`);
  });

  const simulator = startSimulator(pool, { intervalMs: 1000 });

  const shutdown = async (signal) => {
    console.log(`Received ${signal}, shutting down...`);
    try {
      simulator.stop();
    } catch {}

    try {
      server.close();
    } catch {}

    try {
      await pool.end();
    } catch {}

    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});

