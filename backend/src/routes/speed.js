const express = require('express');
const { getLatestReading, getHistory } = require('../db');

function parseLimit(raw) {
  const n = Number.parseInt(String(raw ?? ''), 10);
  if (Number.isNaN(n)) return null;
  return Math.max(1, Math.min(300, n));
}

function createSpeedRoutes({ pool }) {
  const router = express.Router();

  router.get('/latest', async (req, res) => {
    try {
      const latest = await getLatestReading(pool);
      if (!latest) return res.status(404).json({ error: 'no_readings' });
      res.json(latest);
    } catch (err) {
      res.status(500).json({ error: 'server_error' });
    }
  });

  router.get('/history', async (req, res) => {
    try {
      const limit = parseLimit(req.query.limit) ?? 60;
      const readings = await getHistory(pool, limit);
      res.json({ limit, readings });
    } catch (err) {
      res.status(500).json({ error: 'server_error' });
    }
  });

  return router;
}

module.exports = { createSpeedRoutes };

