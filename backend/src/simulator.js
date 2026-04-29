function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function makeSpeedFn() {
  // Keep it readable: a couple sine waves + noise gives a "sensor-like" feel.
  return function speedAtSeconds(t) {
    const base = 90;
    const wave1 = 50 * Math.sin(t / 4);
    const wave2 = 15 * Math.sin(t / 1.2);
    const noise = (Math.random() - 0.5) * 8;

    const raw = base + wave1 + wave2 + noise;
    return clamp(raw, 0, 180);
  };
}

function startSimulator(pool, { intervalMs = 1000 } = {}) {
  const speedAtSeconds = makeSpeedFn();

  let tick = 0;
  const timer = setInterval(async () => {
    tick += 1;
    const t = Date.now() / 1000;
    const speedKmph = speedAtSeconds(t);

    try {
      await pool.query('INSERT INTO speed_readings (speed_kmph) VALUES ($1)', [speedKmph]);
    } catch (err) {
      // If the DB is down briefly, we keep running and try again next tick.
      // Logging too much can flood containers, so keep it minimal.
      console.error('Simulator insert failed:', err.message);
    }
  }, intervalMs);

  return {
    stop() {
      clearInterval(timer);
    },
  };
}

module.exports = { startSimulator };

