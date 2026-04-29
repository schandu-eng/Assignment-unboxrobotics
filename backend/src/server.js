const express = require('express');
const cors = require('cors');
const { createSpeedRoutes } = require('./routes/speed');

function createServer({ pool }) {
  const app = express();

  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
  app.use(
    cors({
      origin: corsOrigin,
      methods: ['GET'],
    }),
  );

  app.get('/healthz', (_req, res) => {
    res.json({ ok: true });
  });

  app.use('/api/speed', createSpeedRoutes({ pool }));

  return app;
}

module.exports = { createServer };

