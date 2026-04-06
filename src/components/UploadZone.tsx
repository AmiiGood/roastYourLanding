"use client";

import { useState, useCallback } from "react";

interface UploadZoneProps {
  onImageReady: (image: string, mediaType: string) => void;
  isLoading: boolean;
}

export default function UploadZone({
  onImageReady,
  isLoading,
}: UploadZoneProps) {
  const [url, setUrl] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [loadingScreenshot, setLoadingScreenshot] = useState(false);
  const [hoverDrop, setHoverDrop] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        onImageReady(base64, file.type || "image/png");
      };
      reader.readAsDataURL(file);
    },
    [onImageReady],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file?.type.startsWith("image/")) handleFile(file);
    },
    [handleFile],
  );

  const handleUrlSubmit = async () => {
    if (!url.trim()) return;
    setLoadingScreenshot(true);
    try {
      const res = await fetch("/api/screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.image) onImageReady(data.image, data.mediaType);
    } catch (err) {
      console.error("Screenshot failed:", err);
    } finally {
      setLoadingScreenshot(false);
    }
  };

  const disabled = isLoading || loadingScreenshot;

  return (
    <div
      className="anim-in"
      style={{
        width: "100%",
        maxWidth: 560,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onMouseEnter={() => setHoverDrop(true)}
        onMouseLeave={() => setHoverDrop(false)}
        onClick={() => {
          if (disabled) return;
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "image/*";
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) handleFile(file);
          };
          input.click();
        }}
        className="glass"
        style={{
          position: "relative",
          padding: "56px 24px",
          textAlign: "center",
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.4 : 1,
          borderColor: dragOver
            ? "var(--accent-warm)"
            : hoverDrop
              ? "rgba(255,255,255,0.15)"
              : undefined,
          background: dragOver ? "rgba(255,143,63,0.05)" : undefined,
          transition: "all 0.25s ease",
        }}
      >
        {/* Corner accents */}
        {[
          {
            top: 12,
            left: 12,
            borderTop: "1px solid",
            borderLeft: "1px solid",
            borderTopLeftRadius: 6,
          },
          {
            top: 12,
            right: 12,
            borderTop: "1px solid",
            borderRight: "1px solid",
            borderTopRightRadius: 6,
          },
          {
            bottom: 12,
            left: 12,
            borderBottom: "1px solid",
            borderLeft: "1px solid",
            borderBottomLeftRadius: 6,
          },
          {
            bottom: 12,
            right: 12,
            borderBottom: "1px solid",
            borderRight: "1px solid",
            borderBottomRightRadius: 6,
          },
        ].map((s, i) => (
          <div
            key={i}
            style={
              {
                position: "absolute",
                width: 20,
                height: 20,
                borderColor: "var(--text-3)",
                opacity: 0.25,
                ...s,
              } as React.CSSProperties
            }
          />
        ))}

        <svg
          width="44"
          height="44"
          viewBox="0 0 48 48"
          fill="none"
          style={{
            margin: "0 auto 16px",
            opacity: hoverDrop ? 0.6 : 0.3,
            transition: "opacity 0.2s",
          }}
        >
          <rect
            x="8"
            y="12"
            width="32"
            height="24"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle
            cx="18"
            cy="22"
            r="3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M8 32L18 24L26 30L34 22L40 28"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p
          style={{
            color: "var(--text-1)",
            fontWeight: 500,
            fontSize: 14,
            letterSpacing: "0.02em",
          }}
        >
          Arrastra tu screenshot aquí
        </p>
        <p
          className="font-code"
          style={{ color: "var(--text-3)", fontSize: 11, marginTop: 6 }}
        >
          .png · .jpg · .webp
        </p>
      </div>

      {/* Divider */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "0 8px",
        }}
      >
        <div
          style={{
            flex: 1,
            height: 1,
            background:
              "linear-gradient(to right, transparent, var(--border-glass), transparent)",
          }}
        />
        <span
          className="font-code"
          style={{
            color: "var(--text-3)",
            fontSize: 10,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          o URL
        </span>
        <div
          style={{
            flex: 1,
            height: 1,
            background:
              "linear-gradient(to right, transparent, var(--border-glass), transparent)",
          }}
        />
      </div>

      {/* URL input */}
      <div style={{ display: "flex", gap: 10 }}>
        <div
          className="glass-sm"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 16px",
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            style={{ opacity: 0.3, flexShrink: 0 }}
          >
            <path
              d="M6.5 11.5L3.5 11.5C2.39543 11.5 1.5 10.6046 1.5 9.5V9.5C1.5 8.39543 2.39543 7.5 3.5 7.5H5.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M9.5 4.5L12.5 4.5C13.6046 4.5 14.5 5.39543 14.5 6.5V6.5C14.5 7.60457 13.6046 8.5 12.5 8.5H10.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M5.5 8H10.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
            placeholder="https://tu-landing.com"
            disabled={disabled}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              padding: "14px 0",
              fontSize: 14,
              color: "var(--text-1)",
              fontFamily: "inherit",
            }}
          />
        </div>
        <button
          onClick={handleUrlSubmit}
          disabled={disabled || !url.trim()}
          style={{
            padding: "14px 24px",
            background: "var(--text-1)",
            color: "var(--surface)",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "inherit",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: disabled || !url.trim() ? "default" : "pointer",
            opacity: disabled || !url.trim() ? 0.3 : 1,
            transition: "opacity 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          {loadingScreenshot ? "Capturando..." : "Capturar"}
        </button>
      </div>
    </div>
  );
}
