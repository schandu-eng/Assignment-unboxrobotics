import { useEffect, useRef, useState } from 'react';

export default function usePollingLatest({
  apiBaseUrl,
  intervalMs = 1000,
}) {
  const [latest, setLatest] = useState(null);
  const [error, setError] = useState(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    let alive = true;
    let timer = null;

    async function pollOnce() {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        setError(null);
        const res = await fetch(`${apiBaseUrl}/api/speed/latest`, {
          method: 'GET',
        });

        if (!res.ok) {
          // 404 is expected before the first insert.
          if (res.status === 404) return;
          throw new Error(`Polling failed: ${res.status}`);
        }

        const json = await res.json();
        if (alive) setLatest(json);
      } catch (err) {
        if (alive) setError(err.message || 'Polling error');
      } finally {
        inFlightRef.current = false;
      }
    }

    pollOnce();
    timer = setInterval(pollOnce, intervalMs);

    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
  }, [apiBaseUrl, intervalMs]);

  return { latest, error };
}

