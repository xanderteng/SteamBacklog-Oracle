import React from 'react';

export const AmbientCanvas: React.FC = () => {
  return (
    <div
      data-testid="ambient-canvas"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Base warm obsidian-espresso foundation */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#11100f] via-[#141210] to-[#0c0b0a]" />

      {/* Layer 1: SVG Fractal Noise Grain Overlay (feTurbulence) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035] mix-blend-screen pointer-events-none">
        <filter id="atelier-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#atelier-grain)" />
      </svg>

      {/* Layer 2: Top-left Deep Crimson & Terracotta Spotlight */}
      <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full blur-[160px] bg-gradient-to-br from-[#7f1d1d]/20 via-[#991b1b]/10 to-transparent" />

      {/* Layer 3: Bottom-right Burnt Bronze & Amber Glow */}
      <div className="absolute -bottom-48 -right-48 w-[800px] h-[800px] rounded-full blur-[170px] bg-gradient-to-tl from-[#78350f]/25 via-[#b45309]/10 to-transparent" />

      {/* Layer 4: Center-left Subtle Muted Plum & Wine Aura */}
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[600px] h-[450px] rounded-full blur-[180px] bg-[#581c87]/5" />

      {/* Layer 5: Ornamental Corner Flourishes (Top-Right & Bottom-Left) */}
      <svg
        className="absolute top-0 right-0 w-96 h-96 text-[#38312b]/15 pointer-events-none"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
      >
        <circle cx="200" cy="0" r="160" strokeDasharray="3 6" />
        <circle cx="200" cy="0" r="120" />
        <circle cx="200" cy="0" r="80" strokeDasharray="2 4" />
        <path d="M120 0 Q 140 60, 200 80" />
      </svg>

      <svg
        className="absolute bottom-0 left-0 w-96 h-96 text-[#38312b]/15 pointer-events-none"
        viewBox="0 0 200 200"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.75"
      >
        <circle cx="0" cy="200" r="160" strokeDasharray="3 6" />
        <circle cx="0" cy="200" r="120" />
        <circle cx="0" cy="200" r="80" strokeDasharray="2 4" />
      </svg>

      {/* Layer 6: Deep Radial Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#0a0908]/90" />
    </div>
  );
};
