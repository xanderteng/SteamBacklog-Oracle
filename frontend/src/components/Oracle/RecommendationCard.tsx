import React, { useState } from 'react';
import { Clock, Gamepad2, Sparkles, Target } from 'lucide-react';
import { GameRecommendationDto } from '../../types/steam';

interface RecommendationCardProps {
  recommendation: GameRecommendationDto;
  rank?: number;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  rank = 1,
}) => {
  const [imageError, setImageError] = useState(false);

  const capsuleUrl = `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${recommendation.appId}/header.jpg`;

  return (
    <article
      data-testid={`recommendation-card-${recommendation.appId}`}
      className="group relative flex flex-col bg-[#24201d] border-2 border-[#b45309]/50 hover:border-[#d97706] rounded-sm overflow-hidden transition-all duration-300 shadow-tactile-card hover:shadow-tactile-raised hover:-translate-y-1"
    >
      {/* Top Header Plaque */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1c1917] border-b border-[#38312b] text-xs font-sans">
        <div className="flex items-center gap-2 text-stone-300">
          <Sparkles className="w-4 h-4 text-[#fbbf24]" />
          <span className="font-serif font-bold tracking-wide text-stone-100">
            Oracle Selection #{rank}
          </span>
          <span className="text-stone-500">•</span>
          <span className="font-sans text-[11px] text-stone-400">App #{recommendation.appId}</span>
        </div>

        {/* Ornate Match Score Emblem */}
        <div
          data-testid="match-score-emblem"
          className="flex items-center gap-1.5 px-3 py-0.5 rounded-full border border-[#d97706]/60 bg-[#78350f]/30 text-[#fde68a] text-xs font-sans font-bold shadow-tactile-button"
        >
          <Target className="w-3.5 h-3.5 text-[#fbbf24]" />
          <span>{recommendation.matchScore}% Match</span>
        </div>
      </div>

      {/* Capsule Header Artwork with Session Duration Pill */}
      <div className="relative aspect-[460/215] w-full bg-[#141210] overflow-hidden">
        {!imageError ? (
          <img
            src={capsuleUrl}
            alt={recommendation.name}
            onError={() => setImageError(true)}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            data-testid="recommendation-fallback-art"
            className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#24201d] to-[#141210] text-center"
          >
            <Gamepad2 className="w-12 h-12 text-stone-500 mb-2 group-hover:text-[#f59e0b] transition-colors" />
            <span className="font-serif font-bold text-sm text-stone-300 line-clamp-1">
              {recommendation.name}
            </span>
          </div>
        )}

        {/* Gradient Melt Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#24201d] via-transparent to-black/40 pointer-events-none" />

        {/* Session Duration Pill Badge */}
        <div
          data-testid="session-duration-pill"
          className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171412]/90 border border-[#38312b] text-stone-200 font-sans text-xs font-medium shadow-tactile-button backdrop-blur-md"
        >
          <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span>Est. {recommendation.estimatedSessionMinutes} min session</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
        <div className="mb-4">
          <h3
            title={recommendation.name}
            className="font-serif font-bold text-xl text-stone-100 group-hover:text-[#f59e0b] transition-colors tracking-wide mb-1"
          >
            {recommendation.name}
          </h3>

          <div className="flex items-center gap-2 font-sans text-xs text-stone-400">
            <span>Playtime so far:</span>
            <span className="text-[#f59e0b] font-semibold">
              {recommendation.playtimeForeverMinutes} mins
            </span>
          </div>
        </div>

        {/* Tactical Briefing Box ("Why Play Now") in Dark Parchment */}
        <div
          data-testid="tactical-briefing-box"
          className="relative bg-[#29231e] border-l-4 border-[#b45309] p-4 rounded-r-sm font-sans text-xs leading-relaxed shadow-tactile-recessed"
        >
          <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[#f59e0b] mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Why Play Now</span>
          </div>
          <p className="text-stone-200 italic font-serif text-sm leading-relaxed">
            "{recommendation.whyPlayNow}"
          </p>
        </div>
      </div>

      {/* Embossed Telemetry Footer */}
      <div className="px-4 py-2 bg-[#1c1917] border-t border-[#38312b] text-xs font-sans flex items-center justify-between text-stone-400">
        <span>Curator's Recommendation</span>
        <span className="text-[#f59e0b] font-semibold">Ready to Play</span>
      </div>
    </article>
  );
};
