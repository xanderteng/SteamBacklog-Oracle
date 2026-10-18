import React, { useState } from 'react';
import { Sparkles, Brain, Clock, Sliders, RefreshCw, Compass } from 'lucide-react';
import { TriageRequest, TriageResponse } from '../../types/steam';
import { CornerBrackets } from '../Common/CornerBrackets';
import { PersonaDossier } from './PersonaDossier';
import { RecommendationCard } from './RecommendationCard';

interface OraclePanelProps {
  onTriage: (request: TriageRequest) => void;
  isTriaging: boolean;
  triageResponse: TriageResponse | null;
  hasBacklog: boolean;
}

const MOOD_PRESETS = [
  'Cozy & Low Energy',
  'High-Octane Action',
  'Deep Narrative RPG',
  'Short Coffee Break',
  'Strategic Mastery',
];

const TIME_TICKS = [15, 30, 45, 60, 90, 120, 180];

export const OraclePanel: React.FC<OraclePanelProps> = ({
  onTriage,
  isTriaging,
  triageResponse,
  hasBacklog,
}) => {
  const [mood, setMood] = useState('High-Octane Action');
  const [availableMinutes, setAvailableMinutes] = useState(45);
  const [maxRecommendations, setMaxRecommendations] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood.trim() || isTriaging || !hasBacklog) return;
    onTriage({
      mood: mood.trim(),
      availableMinutes,
      maxRecommendations,
    });
  };

  return (
    <section
      data-testid="oracle-panel"
      className="relative mb-12 p-5 sm:p-7 bg-obsidian-950/80 border-2 border-neon-cyan/40 rounded-sm shadow-glow-cyan/20 backdrop-blur-md"
    >
      <CornerBrackets accentColor="text-neon-cyan" size="w-4 h-4" />

      {/* Header Deck */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-neon-cyan/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-neon-cyan/15 border border-neon-cyan/40 text-neon-cyan shadow-glow-cyan">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-xl sm:text-2xl text-slate-100 tracking-wider uppercase">
                ORACLE SYNTHESIS MODULE
              </h2>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-neon-indigo/20 text-neon-indigo border border-neon-indigo/30 uppercase tracking-widest font-semibold">
                GEMINI 2.5 FLASH
              </span>
            </div>
            <p className="font-mono text-xs text-slate-400">
              AI-POWERED BACKLOG TRIAGE // CONTEXTUAL RECOMMENDATION ENGINE
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block font-mono text-[10px] text-slate-500">
          <span>COGNITIVE STATE: READY</span>
        </div>
      </div>

      {/* Interactive Consultation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood Selection & Preset Chips */}
        <div>
          <label
            htmlFor="moodInput"
            className="block font-mono text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5 text-neon-cyan" />
            <span>PLAYER MOOD & SESSION INTENT</span>
          </label>

          {/* Preset Chips */}
          <div className="flex flex-wrap gap-2 mb-3">
            {MOOD_PRESETS.map((preset) => {
              const isSelected = mood === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setMood(preset)}
                  className={`px-3 py-1.5 rounded-sm font-mono text-xs tracking-wider transition-all duration-200 border ${
                    isSelected
                      ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan shadow-glow-cyan font-bold scale-[1.02]'
                      : 'bg-obsidian-900 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-500'
                  }`}
                >
                  {preset}
                </button>
              );
            })}
          </div>

          {/* Custom Mood Text Input */}
          <div className="relative">
            <input
              id="moodInput"
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="Or enter custom mood (e.g. Challenging rogue-lite with good soundtrack)..."
              aria-label="Player mood"
              className="w-full px-4 py-2.5 bg-obsidian-900 border border-slate-700 rounded-sm font-mono text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-neon-cyan focus:shadow-glow-cyan transition-all"
            />
          </div>
        </div>

        {/* Time Slider with Visual Tick Marks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="timeSlider"
              className="font-mono text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-neon-cyan" />
              <span>AVAILABLE SESSION DURATION</span>
            </label>
            <span
              data-testid="duration-display"
              className="font-mono font-bold text-sm text-neon-cyan px-2 py-0.5 bg-obsidian-900 border border-neon-cyan/30 rounded"
            >
              {availableMinutes} MINS
            </span>
          </div>

          <div className="relative pt-1 pb-3">
            <input
              id="timeSlider"
              type="range"
              min="5"
              max="180"
              step="5"
              value={availableMinutes}
              onChange={(e) => setAvailableMinutes(Number(e.target.value))}
              aria-label="Available session duration"
              className="w-full h-2 bg-obsidian-900 rounded-lg appearance-none cursor-pointer accent-neon-cyan border border-slate-700"
            />

            {/* Visual Tick Marks */}
            <div className="flex justify-between px-1 mt-1.5 font-mono text-[10px] text-slate-500">
              {TIME_TICKS.map((tick) => (
                <button
                  key={tick}
                  type="button"
                  onClick={() => setAvailableMinutes(tick)}
                  className={`hover:text-neon-cyan transition-colors ${
                    availableMinutes === tick ? 'text-neon-cyan font-bold' : ''
                  }`}
                >
                  {tick}m
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendation Count Selector & Submit Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3">
            <label
              htmlFor="recommendationsCount"
              className="font-mono text-xs text-slate-400 uppercase tracking-wider flex items-center gap-1"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>RECOMMENDATIONS LIMIT:</span>
            </label>
            <select
              id="recommendationsCount"
              value={maxRecommendations}
              onChange={(e) => setMaxRecommendations(Number(e.target.value))}
              aria-label="Recommendations limit"
              className="px-3 py-1.5 bg-obsidian-900 border border-slate-700 rounded font-mono text-xs text-slate-200 focus:outline-none focus:border-neon-cyan"
            >
              <option value="1">1 Game</option>
              <option value="2">2 Games</option>
              <option value="3">3 Games</option>
              <option value="4">4 Games</option>
              <option value="5">5 Games</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={!mood.trim() || isTriaging || !hasBacklog}
            className={`px-8 py-3 rounded-sm font-display font-bold uppercase tracking-widest text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 border ${
              isTriaging || !hasBacklog
                ? 'bg-obsidian-900 border-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-neon-cyan/25 via-neon-indigo/35 to-neon-cyan/25 border-neon-cyan text-neon-cyan hover:border-neon-cyan hover:shadow-glow-cyan hover:from-neon-cyan/35 hover:to-neon-indigo/45 active:scale-[0.98]'
            }`}
          >
            {isTriaging ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-neon-cyan" />
                <span>CONSULTING GEMINI AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-neon-cyan animate-bounce" />
                <span>CONSULT ORACLE</span>
              </>
            )}
          </button>
        </div>

        {!hasBacklog && (
          <p className="font-mono text-xs text-neon-amber text-center">
            * Please synchronize your Steam library first to enable AI triage consultation.
          </p>
        )}
      </form>

      {/* Synthesis Output: Dossier and Recommended Cards */}
      {triageResponse && (
        <div data-testid="triage-results" className="mt-8 pt-8 border-t-2 border-neon-cyan/30">
          <div className="mb-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-neon-cyan font-bold block mb-1">
              TRIAGE DIRECTIVE // RESULTS
            </span>
            <h3 className="font-display font-bold text-2xl text-slate-100 tracking-wide uppercase">
              RECOMMENDED BACKLOG CANDIDATES
            </h3>
          </div>

          {/* Synthesized Persona Dossier */}
          {triageResponse.playerPersonaSummary && (
            <PersonaDossier summary={triageResponse.playerPersonaSummary} />
          )}

          {/* Recommendation Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {triageResponse.recommendations.map((rec, idx) => (
              <RecommendationCard
                key={rec.appId}
                recommendation={rec}
                rank={idx + 1}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
