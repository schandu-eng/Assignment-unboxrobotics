function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

export default function SpeedHistory({ readings, maxSpeed = 180 }) {
  const safe = Array.isArray(readings) ? readings : [];
  const points = safe.map((r, idx) => {
    const xPad = 16;
    const yPadTop = 12;
    const yPadBottom = 26;
    const w = 560;
    const h = 160;
    const usableW = w - xPad * 2;
    const usableH = h - yPadTop - yPadBottom;

    const n = Math.max(1, safe.length);
    const x = xPad + (n === 1 ? 0 : (idx / (n - 1)) * usableW);
    const speed = typeof r?.speedKmph === 'number' ? r.speedKmph : 0;
    const t = clamp(speed / maxSpeed, 0, 1);
    const y = yPadTop + (1 - t) * usableH;

    return { x, y };
  });

  const polyline = points.length > 1 ? points.map((p) => `${p.x},${p.y}`).join(' ') : '';

  const last = safe[safe.length - 1];
  const lastSpeed = typeof last?.speedKmph === 'number' ? last.speedKmph : 0;

  return (
    <div className="card">
      <div className="subtle" style={{ marginTop: 0 }}>
        Recent speed (last {safe.length || 0} readings)
      </div>

      <div style={{ marginTop: 10 }}>
        <svg viewBox="0 0 560 160" width="100%" role="img" aria-label="Speed history">
          <rect x="0" y="0" width="560" height="160" rx="12" fill="rgba(148,163,184,0.08)" />

          <g>
            {[0, 60, 120, 180].map((v) => {
              const y = speedToY(v, maxSpeed, 12, 134);
              return (
                <g key={v}>
                  <line
                    x1="16"
                    x2="544"
                    y1={y}
                    y2={y}
                    stroke="rgba(100,116,139,0.25)"
                    strokeWidth="1"
                  />
                  <text
                    x="10"
                    y={y + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill="rgba(100,116,139,1)"
                  >
                    {v}
                  </text>
                </g>
              );
            })}
          </g>

          {polyline ? (
            <polyline
              fill="none"
              stroke="rgba(59,130,246,0.95)"
              strokeWidth="3"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={polyline}
            />
          ) : null}

          {points.length ? (
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r="5"
              fill="rgba(59,130,246,0.95)"
            />
          ) : null}

          <text
            x="544"
            y="148"
            textAnchor="end"
            fontSize="12"
            fill="rgba(100,116,139,1)"
          >
            Latest: {Math.round(lastSpeed)} km/h
          </text>
        </svg>
      </div>
    </div>
  );
}

