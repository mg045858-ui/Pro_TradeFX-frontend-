import React from "react";

/**
 * BrandLogo — shared across all pages.
 *
 * Props:
 *   size     : "sm" | "md" | "lg"  (default "md")
 *   onClick  : optional click handler (e.g. navigate to home)
 *   style    : extra inline style on the wrapper
 */

const SIZES = {
  sm: { icon: 28, iconFont: 14, textFont: "1rem"  },
  md: { icon: 36, iconFont: 17, textFont: "1.2rem" },
  lg: { icon: 44, iconFont: 21, textFont: "1.5rem" },
};

export function BrandLogo({ size = "md", onClick, style = {} }) {
  const s = SIZES[size] ?? SIZES.md;

  return (
    <a
      href="#"
      onClick={e => { e.preventDefault(); onClick?.(); }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {/* Icon box */}
      <div
        style={{
          width:  s.icon,
          height: s.icon,
          borderRadius: Math.round(s.icon * 0.24),
          flexShrink: 0,
          background: "linear-gradient(135deg,#c8a84b,#8a6010)",
          display: "grid",
          placeItems: "center",
          fontSize: s.iconFont,
          boxShadow: "0 0 14px rgba(200,168,75,.4)",
        }}
      >
        📈
      </div>

      {/* Wordmark */}
      <span
        style={{
          fontFamily: "'Cormorant Garamond', 'Georgia', serif",
          fontSize: s.textFont,
          fontWeight: 800,
          letterSpacing: "-0.01em",
          color: "#edf0fa",
          whiteSpace: "nowrap",
          lineHeight: 1,
        }}
      >
        Pro
        <strong style={{ color: "#c8a84b" }}>FX</strong>
        {" "}Trade
      </span>
    </a>
  );
}
