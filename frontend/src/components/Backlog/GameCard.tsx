import React, { useState } from 'react';
import { Clock, Gamepad2, PlayCircle, ShieldAlert } from 'lucide-react';
import { SteamGameResponse } from '../../types/steam';
import { CornerBrackets } from '../Common/CornerBrackets';

interface GameCardProps {
  game: SteamGameResponse;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [imageError, setImageError] = useState(false);

  const isUntouched = game.playtimeForeverMinutes === 0;
  const capsuleUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${game.appId}/header.jpg`;
  
  // Segmented progress bar (12 segments representing 10 mins each up to 120 threshold)
  const segmentsCount = 12;
  const activeSegments = Math.min(
    Math.ceil((game.playtimeForeverMinutes / 120) * segmentsCount),
    segmentsCount
  );

  return (
    <article
      data-testid={`game-card-${game.appId}`}
      className="group relative flex flex-col bg-obsidian-900/90 border border-slate-700/60 hover:border-neon-cyan/60 rounded-sm overflow-hidden transition-all duration-300 hover:shadow-glow-cyan hover:-translate-y-0.5"
    >
      <CornerBrackets accentColor="text-neon-cyan/40 group-hover:text-neon-cyan" />

      {/* Top Telemetry Strip */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-obsidian-950/80 border-b border-slate-800 text-[10px] font-mono">
        <span className="text-slate-400 tracking-wider">
          APP_ID <span className="text-neon-cyan font-bold">// #{game.appId}</span>
        </span>

        {isUntouched ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neon-amber/15 text-neon-amber border border-neon-amber/30 uppercase tracking-widest font-semibold text-[9px]">
            <ShieldAlert className="w-2.5 h-2.5" /> UNTOUCHED
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-neon-indigo/15 text-neon-indigo border border-neon-indigo/30 uppercase tracking-widest font-semibold text-[9px]">
            <PlayCircle className="w-2.5 h-2.5" /> IN PROGRESS
          </span>
        )}
      </div>

      {/* Capsule Artwork with Angled Vignette Overlay & Fallback */}
      <div className="relative aspect-[460/215] w-full bg-obsidian-950 overflow-hidden">
        {!imageError ? (
          <img
            src={capsuleUrl}
            alt={game.name}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            data-testid="game-fallback-art"
            className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-obsidian-900 to-obsidian-950 border-b border-slate-800 text-center"
          >
            <Gamepad2 className="w-10 h-10 text-slate-600 mb-2 group-hover:text-neon-cyan transition-colors" />
            <span className="font-display font-bold text-xs text-slate-400 uppercase tracking-wider line-clamp-1">
              {game.name}
            </span>
          </div>
        )}

        {/* Angled Vignette Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900 via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* Content Body */}
      <div className="flex-1 p-3.5 flex flex-col justify-between">
        <div className="mb-3">
          <h3
            title={game.name}
            className="font-display font-bold text-base sm:text-lg text-slate-100 group-hover:text-neon-cyan transition-colors line-clamp-1 tracking-wide"
          >
            {game.name}
          </h3>
        </div>

        {/* Playtime Telemetry & Segmented Progress Bar */}
        <div>
          <div className="flex items-center justify-between font-mono text-[11px] text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-500" /> Playtime:
            </span>
            <span className="text-slate-200 font-bold">
              {game.playtimeForeverMinutes} <span className="text-[10px] text-slate-500">/ 120m</span>
            </span>
          </div>

          {/* 12-Segment Playtime Bar */}
          <div
            data-testid="segmented-progress-bar"
            aria-label={`Playtime ${game.playtimeForeverMinutes} of 120 minutes`}
            className="grid grid-cols-12 gap-0.5 h-1.5 w-full bg-obsidian-950 p-0.5 rounded-sm border border-slate-800"
          >
            {Array.from({ length: segmentsCount }).map((_, index) => {
              const isActive = index < activeSegments;
              return (
                <div
                  key={index}
                  className={`h-full rounded-px transition-colors ${
                    isActive
                      ? isUntouched
                        ? 'bg-neon-amber'
                        : 'bg-neon-cyan'
                      : 'bg-slate-800/80'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Embossed Footer */}
      <div className="px-3 py-1 bg-obsidian-950/90 border-t border-slate-800/60 flex items-center justify-between text-[9px] font-mono text-slate-500">
        <span>STATUS: SYNCHRONIZED</span>
        <span className="text-neon-cyan/70 font-semibold">BACKLOG ELIGIBLE</span>
      </div>
    </article>
  );
};
