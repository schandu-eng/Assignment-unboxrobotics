import { useEffect, useMemo, useState } from 'react';
import usePollingLatest from './hooks/usePollingLatest';
import Speedometer from './components/Speedometer';
import SpeedHistory from './components/SpeedHistory';

const MAX_SPEED = 180;
const HISTORY_POINTS = 60;

async function fetchJson(url, { timeoutMs = 4000 } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export default function App() {
  const apiBaseUrl = useMemo(
    () => import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
    [],
  );

  const [history, setHistory] = useState([]);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [bootstrapError, setBootstrapError] = useState(null);

  const { latest, error: pollError } = usePollingLatest({
    apiBaseUrl,
    intervalMs: 1000,
  });

  useEffect(() => {
    let alive = true;

    async function bootstrap() {
      setBootstrapError(null);
      try {
        const url = `${apiBaseUrl}/api/speed/history?limit=${HISTORY_POINTS}`;
        const json = await fetchJson(url);
        const readings = Array.isArray(json?.readings) ? json.readings : [];
        if (!alive) return;

        setHistory(readings);
        const last = readings[readings.length - 1];
        setCurrentSpeed(typeof last?.speedKmph === 'number' ? last.speedKmph : 0);
      } catch (err) {
        if (alive) setBootstrapError(err.message || 'Failed to load history');
      }
    }

    bootstrap();
    return () => {
      alive = false;
    };
  }, [apiBaseUrl]);

  useEffect(() => {
    if (!latest) return;

    setCurrentSpeed(typeof latest.speedKmph === 'number' ? latest.speedKmph : 0);
    setHistory((prev) => {
      const lastId = prev[prev.length - 1]?.id;
      if (lastId === latest.id) return prev;

      const next = [...prev, latest].slice(-HISTORY_POINTS);
      return next;
    });
  }, [latest]);

  return (
    <div className="page">
      <div className="grid2">
        <Speedometer speedKmph={currentSpeed} maxSpeed={MAX_SPEED} />
        <SpeedHistory readings={history} maxSpeed={MAX_SPEED} />
      </div>

      {(bootstrapError || pollError) && (
        <div className="subtle">
          {bootstrapError ? `History error: ${bootstrapError}` : `Polling error: ${pollError}`}
        </div>
      )}
    </div>
  );
}

