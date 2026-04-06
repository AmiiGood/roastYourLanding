"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

interface ShareCardProps {
    data: RoastData;
    screenshot?: string | null;
}

const LABELS: Record<string, string> = {
    ux: "UX",
    copy: "COPY",
    design: "DISEÑO",
    cro: "CRO",
};

const getColor = (s: number) =>
    s >= 70 ? "#4ade80" : s >= 40 ? "#ff8f3f" : "#ff4d4d";

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
        const test = current ? `${current} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth) {
            if (current) lines.push(current);
            current = word;
        } else {
            current = test;
        }
    }
    if (current) lines.push(current);
    return lines;
}

function drawCard(
    canvas: HTMLCanvasElement,
    data: RoastData,
    screenshotImg: HTMLImageElement | null
) {
    const W = 1080;
    const pad = 64;
    const contentW = W - pad * 2;

    // We'll calculate H dynamically
    const ctx = canvas.getContext("2d")!;

    // Pre-calculate heights
    let totalH = pad; // top padding

    // Header: 50px
    totalH += 50;
    totalH += 20; // gap

    // Screenshot: 500px if present
    const screenshotH = screenshotImg ? 500 : 0;
    totalH += screenshotH;
    totalH += screenshotImg ? 24 : 0; // gap

    // Score bar: 80px
    totalH += 80;
    totalH += 16; // gap

    // Roast text: estimate ~70px
    canvas.width = W;
    canvas.height = 2000; // temp for measuring
    ctx.font = "italic 300 22px system-ui, sans-serif";
    const roastLines = wrapText(ctx, `"${data.roast}"`, contentW);
    const roastH = Math.min(roastLines.length, 3) * 30;
    totalH += roastH;
    totalH += 28; // gap

    // Bars: 4 categories × 48px
    totalH += 4 * 48;
    totalH += 20; // gap

    // Footer: 40px
    totalH += 40;
    totalH += pad; // bottom padding

    // Now draw with exact height
    const H = totalH;
    canvas.width = W;
    canvas.height = H;

    // Background
    ctx.fillStyle = "#0c0c10";
    ctx.fillRect(0, 0, W, H);

    // Gradient blobs
    const g1 = ctx.createRadialGradient(0, 0, 0, 0, 0, 450);
    g1.addColorStop(0, "rgba(255,77,77,0.06)");
    g1.addColorStop(1, "transparent");
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    const g2 = ctx.createRadialGradient(W, H, 0, W, H, 450);
    g2.addColorStop(0, "rgba(255,143,63,0.04)");
    g2.addColorStop(1, "transparent");
    ctx.fillStyle = g2;
    ctx.fillRect(0, 0, W, H);

    let y = pad;

    // ── Header: LANDING PAGE ROAST + logo-style score ──
    ctx.font = "500 13px monospace";
    ctx.fillStyle = "#5a5753";
    ctx.fillText("LANDING PAGE ROAST", pad, y + 13);

    // Score on the right: big number + /100
    ctx.font = "900 48px system-ui, sans-serif";
    ctx.fillStyle = getColor(data.overall_score);
    const scoreText = String(data.overall_score);
    const scoreNumW = ctx.measureText(scoreText).width;
    ctx.fillText(scoreText, W - pad - scoreNumW - 48, y + 16);
    ctx.font = "400 18px monospace";
    ctx.fillStyle = "#5a5753";
    ctx.fillText("/100", W - pad - 42, y + 16);

    y += 50 + 20;

    // ── Screenshot ──
    if (screenshotImg) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(pad, y, contentW, screenshotH, 12);
        ctx.clip();

        const imgAspect = screenshotImg.width / screenshotImg.height;
        const areaAspect = contentW / screenshotH;
        let dw, dh, dx, dy;

        if (imgAspect > areaAspect) {
            dh = screenshotH;
            dw = dh * imgAspect;
            dx = pad - (dw - contentW) / 2;
            dy = y;
        } else {
            dw = contentW;
            dh = dw / imgAspect;
            dx = pad;
            dy = y;
        }
        ctx.drawImage(screenshotImg, dx, dy, dw, dh);

        // Bottom fade
        const fade = ctx.createLinearGradient(0, y + screenshotH - 80, 0, y + screenshotH);
        fade.addColorStop(0, "rgba(12,12,16,0)");
        fade.addColorStop(1, "rgba(12,12,16,0.7)");
        ctx.fillStyle = fade;
        ctx.fillRect(pad, y, contentW, screenshotH);
        ctx.restore();

        // Border
        ctx.strokeStyle = "rgba(255,255,255,0.07)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(pad, y, contentW, screenshotH, 12);
        ctx.stroke();

        y += screenshotH + 24;
    }

    // ── Overall score bar (full width) ──
    const barBgH = 64;
    ctx.fillStyle = "rgba(255,255,255,0.03)";
    ctx.beginPath();
    ctx.roundRect(pad, y, contentW, barBgH, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(pad, y, contentW, barBgH, 12);
    ctx.stroke();

    // Score fill inside
    const fillW = contentW * (data.overall_score / 100);
    ctx.fillStyle = getColor(data.overall_score) + "18"; // low opacity
    ctx.beginPath();
    ctx.roundRect(pad, y, fillW, barBgH, 12);
    ctx.fill();

    // Text inside bar
    ctx.font = "700 28px system-ui, sans-serif";
    ctx.fillStyle = getColor(data.overall_score);
    ctx.fillText(String(data.overall_score) + " puntos", pad + 20, y + 40);

    ctx.font = "400 15px system-ui, sans-serif";
    ctx.fillStyle = "#8a8680";
    const verdictText = data.overall_score >= 70 ? "Buen trabajo" : data.overall_score >= 40 ? "Necesita mejoras" : "Crítico";
    const vw = ctx.measureText(verdictText).width;
    ctx.fillText(verdictText, W - pad - 20 - vw, y + 40);

    y += barBgH + 16;

    // ── Roast quote ──
    ctx.font = "italic 300 22px system-ui, sans-serif";
    ctx.fillStyle = "#8a8680";
    const lines = wrapText(ctx, `"${data.roast}"`, contentW);
    for (const line of lines.slice(0, 3)) {
        ctx.fillText(line, pad, y + 22);
        y += 30;
    }
    y += 28;

    // ── Category bars (compact) ──
    const entries = Object.entries(data.categories);
    const catGap = 48;

    entries.forEach(([key, cat], i) => {
        const cy = y + i * catGap;

        // Label + score on same line
        ctx.font = "600 16px system-ui, sans-serif";
        ctx.fillStyle = "#f0ede8";
        ctx.fillText(LABELS[key], pad, cy + 2);

        ctx.font = "700 16px monospace";
        ctx.fillStyle = getColor(cat.score);
        const nw = ctx.measureText(String(cat.score)).width;
        ctx.fillText(String(cat.score), W - pad - nw, cy + 2);

        // Bar
        const barY = cy + 14;
        ctx.fillStyle = "rgba(255,255,255,0.05)";
        ctx.beginPath();
        ctx.roundRect(pad, barY, contentW, 6, 3);
        ctx.fill();

        ctx.fillStyle = getColor(cat.score);
        ctx.beginPath();
        ctx.roundRect(pad, barY, contentW * (cat.score / 100), 6, 3);
        ctx.fill();
    });

    y += 4 * catGap + 20;

    // ── Footer ──
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(W - pad, y);
    ctx.stroke();

    ctx.font = "500 12px monospace";
    ctx.fillStyle = "#5a5753";
    ctx.fillText("ROAST MY LANDING", pad, y + 28);
    const fr = "Powered by Claude Vision";
    ctx.fillText(fr, W - pad - ctx.measureText(fr).width, y + 28);

    // ── Grain (fast: every 4th pixel) ──
    const imageData = ctx.getImageData(0, 0, W, H);
    const px = imageData.data;
    for (let i = 0; i < px.length; i += 16) {
        const n = (Math.random() - 0.5) * 10;
        px[i] = Math.min(255, Math.max(0, px[i] + n));
        px[i + 1] = Math.min(255, Math.max(0, px[i + 1] + n));
        px[i + 2] = Math.min(255, Math.max(0, px[i + 2] + n));
    }
    ctx.putImageData(imageData, 0, 0);
}

export default function ShareCard({ data, screenshot }: ShareCardProps) {
    const previewRef = useRef<HTMLCanvasElement>(null);
    const [ready, setReady] = useState(false);
    const imgRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        if (!screenshot) {
            setReady(true);
            if (previewRef.current) drawCard(previewRef.current, data, null);
            return;
        }
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            imgRef.current = img;
            setReady(true);
            if (previewRef.current) drawCard(previewRef.current, data, img);
        };
        img.src = screenshot;
    }, [screenshot, data]);

    const handleDownload = useCallback(() => {
        const canvas = document.createElement("canvas");
        drawCard(canvas, data, imgRef.current);
        const link = document.createElement("a");
        link.download = `roast-${data.overall_score}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
    }, [data]);

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <canvas
                ref={previewRef}
                style={{
                    width: "100%",
                    maxWidth: 420,
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-glass)",
                }}
            />
            <button
                onClick={handleDownload}
                style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "12px 28px",
                    background: "linear-gradient(135deg, #ff4d4d, #ff8f3f)",
                    color: "#fff", fontSize: 14, fontWeight: 600,
                    fontFamily: "inherit", border: "none",
                    borderRadius: "var(--radius-md)", cursor: "pointer",
                }}
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v8m0 0l3-3m-3 3L5 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 12h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Descargar para Instagram
            </button>
        </div>
    );
}