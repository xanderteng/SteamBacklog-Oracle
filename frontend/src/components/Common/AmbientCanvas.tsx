import React from 'react';

export const AmbientCanvas: React.FC = () => {
  return (
    <div
      data-testid="ambient-canvas"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Layer 1: Geometric Grid Pattern */}
      <div className="absolute inset-0 bg-grid-matrix opacity-70" />

      {/* Layer 2: Dot-matrix overlay for textured depth */}
      <div className="absolute inset-0 bg-dot-matrix opacity-25" />

      {/* Layer 3: Top-left Crimson/Amber Spotlight */}
      <div className="absolute -top-32 -left-32 w-[650px] h-[650px] rounded-full blur-[140px] bg-gradient-to-br from-neon-amber/15 via-neon-crimson/10 to-transparent" />

      {/* Layer 4: Bottom-right Electric Cyan/Indigo Spotlight */}
      <div className="absolute -bottom-40 -right-40 w-[750px] h-[750px] rounded-full blur-[150px] bg-gradient-to-tl from-neon-cyan/15 via-neon-indigo/10 to-transparent" />

      {/* Layer 5: Center subtle ambient aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full blur-[160px] bg-neon-indigo/5" />

      {/* Layer 6: Subtle scanline overlay for tactical cockpit glass feel */}
      <div className="absolute inset-0 bg-scanlines opacity-40" />

      {/* Layer 7: Edge Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-obsidian-950/80" />
    </div>
  );
};
