import React, { useState } from 'react';
import { Clock, Gamepad2 } from 'lucide-react';
import { SteamGameResponse } from '../../types/steam';

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
      className="group relative flex flex-col bg-[#1c1917] border border-[#38312b] hover:border-[#b45309] rounded-sm overflow-hidden transition-all duration-300 shadow-tactile-card hover:shadow-tactile-raised hover:-translate-y-1"
    >
      {/* Full-Bleed Capsule Artwork with Gradient Melt into Card Body */}
      <div className="relative aspect-[460/215] w-full bg-[#141210] overflow-hidden">
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
            className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#24201d] to-[#141210] text-center"
          >
            <Gamepad2 className="w-10 h-10 text-stone-500 mb-2 group-hover:text-[#f59e0b] transition-colors" />
            <span className="font-serif font-bold text-xs text-stone-300 line-clamp-1">
              {game.name}
            </span>
          </div>
        )}

        {/* Gradient Melt into Matte Body */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917] via-transparent to-black/40 pointer-events-none" />

        {/* Top Floating App ID Badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="font-sans text-[11px] font-semibold text-stone-300 bg-[#141210]/85 backdrop-blur-md px-2 py-0.5 rounded-sm border border-[#38312b] shadow-tactile-recessed">
            #{game.appId}
          </span>
        </div>

        {/* Top Floating Embossed Pill Badge */}
        <div className="absolute top-2.5 right-2.5">
          {isUntouched ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#7f1d1d]/90 text-[#fca5a5] border border-[#991b1b] shadow-tactile-button text-[11px] font-sans font-semibold tracking-wide backdrop-blur-md">
              Untouched
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#78350f]/90 text-[#fde68a] border border-[#b45309] shadow-tactile-button text-[11px] font-sans font-semibold tracking-wide backdrop-blur-md">
              In Progress
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div className="mb-3">
          <h3
            title={game.name}
            className="font-serif font-bold text-lg text-stone-100 group-hover:text-[#f59e0b] transition-colors line-clamp-1 tracking-wide"
          >
            {game.name}
          </h3>
        </div>

        {/* Playtime Progress & Physical Recessed Trough */}
        <div>
          <div className="flex items-center justify-between font-sans text-xs text-stone-400 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone-500" /> Playtime:
            </span>
            <span className="text-stone-200 font-semibold">
              {game.playtimeForeverMinutes} <span className="text-stone-500 font-normal">/ 120m</span>
            </span>
          </div>

          {/* Physical Recessed Progress Trough */}
          <div
            data-testid="segmented-progress-bar"
            aria-label={`Playtime ${game.playtimeForeverMinutes} of 120 minutes`}
            className="grid grid-cols-12 gap-0.5 h-2 w-full bg-[#12100e] p-0.5 rounded-full border border-[#2e2823] shadow-tactile-recessed"
          >
            {Array.from({ length: segmentsCount }).map((_, index) => {
              const isActive = index < activeSegments;
              return (
                <div
                  key={index}
                  className={`h-full rounded-full transition-colors ${
                    isActive
                      ? isUntouched
                        ? 'bg-[#c2410c]'
                        : 'bg-[#d97706]'
                      : 'bg-[#29231e]'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Embossed Stoneware Footer Plaque */}
      <div className="px-4 py-2 bg-[#171412] border-t border-[#2e2823] flex items-center justify-between text-[11px] font-sans text-stone-400">
        <span className="font-medium text-stone-400">Backlog Candidate</span>
        <span className="text-[#f59e0b] font-semibold">&lt; 2h Playtime</span>
      </div>
    </article>
  );
};
