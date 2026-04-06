interface ScoreCardProps {
  score: number;
  label: string;
  roast: string;
  suggestions: string[];
  delay?: number;
}

export default function ScoreCard({
  score,
  label,
  roast,
  suggestions,
  delay = 0,
}: ScoreCardProps) {
  const circ = 2 * Math.PI * 36;
  const off = circ - (score / 100) * circ;

  const accent =
    score >= 70
      ? { color: "#4ade80", glow: "rgba(74,222,128,0.12)" }
      : score >= 40
        ? { color: "#ff8f3f", glow: "rgba(255,143,63,0.12)" }
        : { color: "#ff4d4d", glow: "rgba(255,77,77,0.12)" };

  return (
    <div
      className="glass-sm anim-in"
      style={{ padding: 20, animationDelay: `${delay}ms` }}
    >
      <div style={{ display: "flex", gap: 20 }}>
        {/* Ring */}
        <div
          style={{ position: "relative", width: 76, height: 76, flexShrink: 0 }}
        >
          <svg
            width="76"
            height="76"
            viewBox="0 0 80 80"
            style={{ transform: "rotate(-90deg)" }}
          >
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              strokeWidth="4"
              stroke="rgba(255,255,255,0.06)"
            />
            <circle
              cx="40"
              cy="40"
              r="36"
              fill="none"
              strokeWidth="4"
              stroke={accent.color}
              strokeLinecap="round"
              strokeDasharray={circ}
              strokeDashoffset={circ}
              className="anim-score"
              style={{ "--circ": circ, "--off": off } as React.CSSProperties}
            />
          </svg>
          <span
            className="font-code"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              fontWeight: 700,
              color: accent.color,
            }}
          >
            {score}
          </span>
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <h3
              style={{
                color: "var(--text-1)",
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {label}
            </h3>
            <div
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: accent.color,
              }}
            />
          </div>
          <p style={{ color: "var(--text-2)", fontSize: 13, lineHeight: 1.6 }}>
            {roast}
          </p>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid var(--border-glass)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {suggestions.map((s, i) => (
            <div
              key={i}
              style={{ display: "flex", gap: 10, alignItems: "baseline" }}
            >
              <span
                className="font-code"
                style={{
                  color: "var(--accent-warm)",
                  fontSize: 11,
                  flexShrink: 0,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                style={{
                  color: "var(--text-2)",
                  fontSize: 12,
                  lineHeight: 1.5,
                }}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
