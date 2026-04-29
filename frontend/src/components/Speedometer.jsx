function pointOnArc(cx, cy, r, angleDeg) {
  // angleDeg: 0 = right, 90 = top, 180 = left (we invert Y for SVG).
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad),
  };
}

function arcPath(cx, cy, r, startAngleDeg, endAngleDeg, segments = 70) {
  const points = [];
  for (let i = 0; i <= segments; i += 1) {
    const a = startAngleDeg + (endAngleDeg - startAngleDeg) * (i / segments);
    points.push(pointOnArc(cx, cy, r, a));
  }
  const first = points[0];
  const rest = points.slice(1);
  return [
    `M ${first.x} ${first.y}`,
    ...rest.map((p) => `L ${p.x} ${p.y}`),
  ].join(' ');
}

export default function Speedometer({ speedKmph, maxSpeed = 180 }) {
  const speed = Number.isFinite(speedKmph) ? speedKmph : 0;
  const clamped = Math.max(0, Math.min(maxSpeed, speed));
  const t = clamped / maxSpeed;

  const rotationDeg = -90 + 180 * t; // -90 = left, 90 = right

  const sizeW = 320;
  const sizeH = 190;
  const cx = 160;
  const cy = 170;
  const r = 120;

  const trackD = arcPath(cx, cy, r, 180, 0);
  const progressEndAngle = 180 - 180 * t;
  const progressD = arcPath(cx, cy, r, 180, progressEndAngle);

  const ticks = [0, 60, 120, 180];

  return (
    <div className="card">
      <div className="speedValue">
        <strong>{Math.round(clamped)}</strong>
        <span>km/h</span>
      </div>
      <div className="subtle">Updates every 1 second</div>

      <div style={{ marginTop: 10 }}>
        <svg
          width="100%"
          viewBox={`0 0 ${sizeW} ${sizeH}`}
          role="img"
          aria-label="Speedometer gauge"
        >
          <path
            d={trackD}
            fill="none"
            stroke="rgba(148,163,184,0.35)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <path
            d={progressD}
            fill="none"
            stroke="rgba(59,130,246,0.9)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {ticks.map((v) => {
            const tickT = v / maxSpeed;
            const polar = 180 - 180 * tickT;
            const a = polar;
            const p1 = pointOnArc(cx, cy, r * 0.92, a);
            const p2 = pointOnArc(cx, cy, r * 0.82, a);
            return (
              <line
                key={v}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="rgba(15,23,42,0.35)"
                strokeWidth="3"
              />
            );
          })}

          <g transform={`rotate(${rotationDeg} ${cx} ${cy})`}>
            <line
              x1={cx}
              y1={cy}
              x2={cx}
              y2={cy - r * 0.86}
              stroke="rgba(15,23,42,0.85)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx={cx} cy={cy} r="10" fill="rgba(15,23,42,0.85)" />
            <circle cx={cx} cy={cy} r="6" fill="white" />
          </g>

          <text
            x={cx - r}
            y={cy + 26}
            textAnchor="middle"
            fontSize="14"
            fill="rgba(100,116,139,1)"
          >
            0
          </text>
          <text
            x={cx + r}
            y={cy + 26}
            textAnchor="middle"
            fontSize="14"
            fill="rgba(100,116,139,1)"
          >
            {maxSpeed}
          </text>
        </svg>
      </div>
    </div>
  );
}

