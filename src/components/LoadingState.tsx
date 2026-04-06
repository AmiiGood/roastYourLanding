"use client";

import { useState, useEffect, useRef } from "react";

interface LoadingStateProps {
    preview?: string | null;
}

const PHRASES = [
    "Juzgando tu hero section...",
    "Leyendo tu copy con lupa...",
    "Contando los CTAs...",
    "Evaluando tu color palette...",
    "Calculando nivel de cringe...",
    "Buscando el botón de compra...",
    "Analizando la tipografía...",
    "Midiendo el whitespace...",
    "Revisando la jerarquía visual...",
    "Verificando responsive...",
    "Escaneando dark patterns...",
    "Casi listo, aguanta...",
];

export default function LoadingState({ preview }: LoadingStateProps) {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [fadingOut, setFadingOut] = useState(false);
    const animRef = useRef<number>(0);
    const startTime = useRef(Date.now());

    // Rotate phrases
    useEffect(() => {
        const interval = setInterval(() => {
            setFadingOut(true);
            setTimeout(() => {
                setPhraseIndex((i) => (i + 1) % PHRASES.length);
                setFadingOut(false);
            }, 200);
        }, 2200);
        return () => clearInterval(interval);
    }, []);

    // Animate score needle (bouncy, erratic movement)
    useEffect(() => {
        let frame: number;
        const animate = () => {
            const elapsed = (Date.now() - startTime.current) / 1000;
            // Erratic bouncing score that feels like it's "calculating"
            const base = 50 + Math.sin(elapsed * 1.3) * 25;
            const noise1 = Math.sin(elapsed * 4.7) * 15;
            const noise2 = Math.cos(elapsed * 7.3) * 8;
            const jitter = Math.random() * 6 - 3;
            const val = Math.max(0, Math.min(100, base + noise1 + noise2 + jitter));
            setScore(Math.round(val));
            frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(frame);
    }, []);

    const circumference = 2 * Math.PI * 80;
    const offset = circumference - (score / 100) * circumference;
    const needleAngle = -90 + (score / 100) * 180; // -90 to 90 degrees

    const getColor = (s: number) => {
        if (s >= 70) return "#4ade80";
        if (s >= 40) return "#ff8f3f";
        return "#ff4d4d";
    };

    const currentColor = getColor(score);

    return (
        <div className="anim-in" style={{
            maxWidth: 560,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
        }}>
            {/* Screenshot preview */}
            {preview && (
                <div className="glass" style={{ padding: 6, display: "inline-block" }}>
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            maxWidth: 240,
                            borderRadius: "calc(var(--radius-lg) - 4px)",
                            opacity: 0.45,
                            filter: "saturate(0.3)",
                        }}
                    />
                </div>
            )}

            {/* Roast-o-meter */}
            <div style={{ position: "relative", width: 220, height: 130 }}>
                <svg width="220" height="130" viewBox="0 0 220 130">
                    {/* Background arc */}
                    <path
                        d="M 20 120 A 90 90 0 0 1 200 120"
                        fill="none"
                        stroke="rgba(255,255,255,0.06)"
                        strokeWidth="8"
                        strokeLinecap="round"
                    />
                    {/* Colored arc fill */}
                    <path
                        d="M 20 120 A 90 90 0 0 1 200 120"
                        fill="none"
                        stroke={currentColor}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray="283"
                        strokeDashoffset={283 - (score / 100) * 283}
                        style={{ transition: "stroke-dashoffset 0.1s linear, stroke 0.3s ease" }}
                    />
                    {/* Tick marks */}
                    {[0, 25, 50, 75, 100].map((tick) => {
                        const angle = (-180 + (tick / 100) * 180) * (Math.PI / 180);
                        const x1 = 110 + Math.cos(angle) * 78;
                        const y1 = 120 + Math.sin(angle) * 78;
                        const x2 = 110 + Math.cos(angle) * 86;
                        const y2 = 120 + Math.sin(angle) * 86;
                        return (
                            <line
                                key={tick}
                                x1={x1} y1={y1} x2={x2} y2={y2}
                                stroke="rgba(255,255,255,0.15)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        );
                    })}
                    {/* Needle */}
                    <g style={{
                        transform: `rotate(${needleAngle}deg)`,
                        transformOrigin: "110px 120px",
                        transition: "transform 0.1s linear",
                    }}>
                        <line
                            x1="110" y1="120"
                            x2="110" y2="42"
                            stroke={currentColor}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            style={{ filter: `drop-shadow(0 0 6px ${currentColor}40)` }}
                        />
                        <circle cx="110" cy="120" r="5" fill={currentColor} />
                    </g>
                </svg>

                {/* Score number */}
                <div className="font-code" style={{
                    position: "absolute",
                    bottom: 0,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 32,
                    fontWeight: 700,
                    color: currentColor,
                    transition: "color 0.3s ease",
                    textShadow: `0 0 20px ${currentColor}30`,
                }}>
                    {score}
                </div>
            </div>

            {/* Rotating phrases */}
            <div style={{
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
            }}>
                <p style={{
                    color: "var(--text-2)",
                    fontSize: 14,
                    fontWeight: 300,
                    opacity: fadingOut ? 0 : 1,
                    transform: fadingOut ? "translateY(8px)" : "translateY(0)",
                    transition: "all 0.2s ease",
                }}>
                    {PHRASES[phraseIndex]}
                </p>
            </div>

            {/* Subtle progress dots */}
            <div style={{ display: "flex", gap: 6 }}>
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="anim-pulse"
                        style={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: "var(--accent-warm)",
                            animationDelay: `${i * 0.2}s`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}