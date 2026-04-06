import ScoreCard from "./ScoreCard";
import ShareCard from "./ShareCard";

interface Category {
  score: number;
  roast: string;
  suggestions: string[];
}

interface RoastData {
  overall_score: number;
  roast: string;
  categories: {
    ux: Category;
    copy: Category;
    design: Category;
    cro: Category;
  };
}

const LABELS: Record<string, string> = {
  ux: "◐ Experiencia",
  copy: "¶ Copywriting",
  design: "◆ Diseño",
  cro: "⬆ Conversión",
};

// Cambia la firma
export default function RoastResults({ data, screenshot }: { data: RoastData; screenshot?: string | null }) {
  const s = data.overall_score;
  const accentColor = s >= 70 ? "#4ade80" : s >= 40 ? "#ff8f3f" : "#ff4d4d";

  const verdict = s >= 80
    ? "Impressive. Tu landing respira bien."
    : s >= 60
      ? "Tiene base, pero hay trabajo por hacer."
      : s >= 40
        ? "Necesita atención urgente."
        : "Hora de empezar de cero.";

  return (
    <div style={{ width: "100%", maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Hero score */}
      <div className="anim-in" style={{ textAlign: "center" }}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <span
            className="font-display anim-count"
            style={{
              fontSize: "clamp(6rem, 15vw, 10rem)",
              fontWeight: 900,
              lineHeight: 1,
              color: accentColor,
              display: "block",
            }}
          >
            {data.overall_score}
          </span>
          <span className="font-code" style={{
            position: "absolute", right: -28, top: 12,
            color: "var(--text-3)", fontSize: 13,
          }}>
            /100
          </span>
        </div>

        <p style={{ color: "var(--text-2)", fontSize: 15, fontWeight: 300, marginTop: 8 }}>
          {verdict}
        </p>
      </div>

      {/* Main roast quote */}
      <div className="glass anim-in" style={{ padding: 24, animationDelay: "0.1s" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <span style={{ color: "var(--accent-hot)", fontSize: 20, lineHeight: 1, marginTop: 2 }}>"</span>
          <p style={{ color: "var(--text-1)", fontSize: 14, lineHeight: 1.7, fontWeight: 300, fontStyle: "italic", flex: 1 }}>
            {data.roast}
          </p>
          <span style={{ color: "var(--accent-hot)", fontSize: 20, lineHeight: 1, alignSelf: "flex-end" }}>"</span>
        </div>
      </div>

      {/* Category cards */}
      <div className="stagger" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {Object.entries(data.categories).map(([key, cat], i) => (
          <ScoreCard
            key={key}
            score={cat.score}
            label={LABELS[key]}
            roast={cat.roast}
            suggestions={cat.suggestions}
            delay={i * 80}
          />
        ))}
      </div>

      {/* Share card */}
      <div className="anim-in" style={{ animationDelay: "0.35s" }}>
        <p style={{ color: "var(--text-2)", fontSize: 13, textAlign: "center", marginBottom: 16, fontWeight: 300 }}>
          Comparte tu resultado
        </p>
        <ShareCard data={data} screenshot={screenshot} />
      </div>
    </div>
  );
}