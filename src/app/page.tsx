"use client";

import { useState } from "react";
import UploadZone from "@/components/UploadZone";
import RoastResults from "@/components/RoastResults";
import LoadingState from "@/components/LoadingState";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleRoast = async (image: string, mediaType: string) => {
    setPreview(`data:${mediaType};base64,${image}`);
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, mediaType }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (err) {
      console.error("Roast failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setPreview(null);
  };

  return (
    <main style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}>
      {/* Ambient blobs */}
      <div
        className="blob anim-drift"
        style={{ width: 500, height: 500, top: -200, left: -200, background: "var(--accent-hot)", opacity: 0.12 }}
      />
      <div
        className="blob anim-drift"
        style={{ width: 400, height: 400, top: "30%", right: -150, background: "var(--accent-warm)", opacity: 0.08, animationDelay: "-7s" }}
      />
      <div
        className="blob anim-drift"
        style={{ width: 350, height: 350, bottom: -100, left: "30%", background: "var(--accent-sun)", opacity: 0.06, animationDelay: "-14s" }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10 }}>
        {/* Header */}
        <header style={{ paddingTop: "6rem", paddingBottom: "3rem", textAlign: "center", paddingInline: "1.5rem" }}>
          <div className="anim-in">
            <p className="font-code" style={{ color: "var(--text-3)", fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 24 }}>
              AI-powered landing page analysis
            </p>

            <h1 className="font-display" style={{ fontSize: "clamp(3rem, 8vw, 5rem)", lineHeight: 0.95, marginBottom: 20, fontStyle: "italic", color: "var(--text-1)" }}>
              Roast my<br />
              <span className="gradient-text" style={{ fontFamily: "var(--font-sans), system-ui, sans-serif", fontWeight: 800, fontStyle: "normal", letterSpacing: "-0.03em" }}>
                landing
              </span>
            </h1>

            <p style={{ color: "var(--text-2)", fontSize: 15, maxWidth: 380, margin: "0 auto", fontWeight: 300, lineHeight: 1.6 }}>
              Sube tu landing page y obtén un análisis brutal de UX, copy, diseño y conversión.
            </p>
          </div>
        </header>

        {/* Main */}
        <div style={{ padding: "0 1.5rem 6rem" }}>
          {!result && !loading && (
            <UploadZone onImageReady={handleRoast} isLoading={loading} />
          )}

          {loading && <LoadingState preview={preview} />}

          {result && (
            <div>
              <RoastResults data={result} screenshot={preview} />
              <div className="anim-in" style={{ textAlign: "center", marginTop: 48, animationDelay: "0.4s" }}>
                <button
                  onClick={reset}
                  className="glass"
                  style={{
                    padding: "12px 32px",
                    fontSize: 14,
                    color: "var(--text-2)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: "var(--bg-glass)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "var(--radius-md)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--text-1)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--text-2)";
                    e.currentTarget.style.borderColor = "var(--border-glass)";
                  }}
                >
                  Roastear otra →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          padding: 16, textAlign: "center", pointerEvents: "none",
        }}>
          <span className="font-code" style={{ color: "var(--text-3)", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase" }}>
            Powered by Claude Vision
          </span>
        </div>
      </div>
    </main>
  );
}