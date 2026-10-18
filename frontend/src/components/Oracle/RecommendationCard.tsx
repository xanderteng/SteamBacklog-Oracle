import React, { useState } from 'react';
import { Clock, Gamepad2, Sparkles, Target, Zap } from 'lucide-react';
import { GameRecommendationDto } from '../../types/steam';
import { CornerBrackets } from '../Common/CornerBrackets';

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

  // Color tiering based on match score
  const isTopMatch = recommendation.matchScore >= 90;
  const matchColor = isTopMatch
    ? 'text-neon-cyan border-neon-cyan bg-neon-cyan/15 shadow-glow-cyan'
    : 'text-neon-amber border-neon-amber bg-neon-amber/15 shadow-glow-amber';

  return (
    <article
      data-testid={`recommendation-card-${recommendation.appId}`}
      className="group relative flex flex-col bg-obsidian-900/95 border-2 border-neon-cyan/40 hover:border-neon-cyan rounded-sm overflow-hidden transition-all duration-300 shadow-glow-cyan/30 hover:shadow-glow-cyan hover:-translate-y-1"
    >
      <CornerBrackets accentColor="text-neon-cyan" size="w-3.5 h-3.5" />

      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-obsidian-950/90 border-b border-neon-cyan/20 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-neon-cyan" />
          <span className="font-bold tracking-widest text-[11px] text-neon-cyan">
            ORACLE PRIORITY #{rank}
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-[10px] text-slate-400">APP_ID #{recommendation.appId}</span>
        </div>

        {/* Radial Match Score Emblem */}
        <div
          data-testid="match-score-emblem"
          className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-bold font-mono tracking-wider ${matchColor}`}
        >
          <Target className="w-3 h-3" />
          <span>{recommendation.matchScore}% MATCH</span>
        </div>
      </div>

      {/* Capsule Header Artwork with Session Duration Pill */}
      <div className="relative aspect-[460/215] w-full bg-obsidian-950 overflow-hidden">
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
            className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-obsidian-900 to-obsidian-950 border-b border-slate-800 text-center"
          >
            <Gamepad2 className="w-12 h-12 text-slate-600 mb-2 group-hover:text-neon-cyan transition-colors" />
            <span className="font-display font-bold text-sm text-slate-300 uppercase tracking-wider line-clamp-1">
              {recommendation.name}
            </span>
          </div>
        )}

        {/* Angled Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian-900 via-transparent to-black/40 pointer-events-none" />

        {/* Session Duration Pill Badge */}
        <div
          data-testid="session-duration-pill"
          className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-obsidian-950/90 border border-slate-700/80 text-slate-200 font-mono text-[11px] tracking-wide backdrop-blur-md shadow-lg"
        >
          <Clock className="w-3.5 h-3.5 text-neon-cyan" />
          <span>EST. {recommendation.estimatedSessionMinutes} MIN SESSION</span>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div className="mb-3">
          <h3
            title={recommendation.name}
            className="font-display font-bold text-lg sm:text-xl text-slate-100 group-hover:text-neon-cyan transition-colors tracking-wide mb-1"
          >
            {recommendation.name}
          </h3>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span>Playtime so far:</span>
            <span className="text-neon-cyan font-bold">
              {recommendation.playtimeForeverMinutes} mins
            </span>
          </div>
        </div>

        {/* Tactical Briefing Box ("Why Play Now") */}
        <div
          data-testid="tactical-briefing-box"
          className="relative bg-obsidian-950/80 border-l-2 border-neon-cyan p-3 rounded-r-sm font-mono text-xs leading-relaxed"
        >
          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-neon-cyan/90 mb-1 tracking-widest">
            <Zap className="w-3 h-3 text-neon-cyan" />
            <span>TACTICAL BRIEFING // WHY PLAY NOW</span>
          </div>
          <p className="text-slate-300 italic">
            "{recommendation.whyPlayNow}"
          </p>
        </div>
      </div>

      {/* Embossed Telemetry Footer */}
      <div className="px-4 py-1.5 bg-obsidian-950 border-t border-slate-800 text-[10px] font-mono flex items-center justify-between text-slate-500">
        <span>AI SYNTHESIS COMPLETE</span>
        <span className="text-neon-cyan font-semibold tracking-wider">READY FOR DEPLOYMENT</span>
      </div>
    </article>
  );
};
