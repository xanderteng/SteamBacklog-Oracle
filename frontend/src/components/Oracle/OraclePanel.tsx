import React, { useState } from 'react';
import { Sparkles, Compass, Clock, Sliders, RefreshCw, BookOpen } from 'lucide-react';
import { TriageRequest, TriageResponse } from '../../types/steam';
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

const MIN_SESSION_MINUTES = 15;
const MAX_SESSION_MINUTES = 180;
const SESSION_STEP_MINUTES = 5;
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
      className="relative mb-12 p-5 sm:p-7 bg-[#1c1917] border border-[#38312b] rounded-sm shadow-tactile-card backdrop-blur-sm"
    >
      {/* Header Deck: Editorial Consultation Branding */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 mb-6 border-b border-[#2e2823]">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-sm bg-[#24201d] border border-[#38312b] text-[#fbbf24] shadow-tactile-recessed">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-stone-100 tracking-wide">
              Oracle Consultation Atelier
            </h2>
            <p className="font-sans text-xs text-stone-400 mt-0.5">
              Contextual AI backlog triage tailored to your available time and mood
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#141210] border border-[#38312b] rounded-sm text-xs font-sans text-stone-400">
          <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
          <span>Curator Ready</span>
        </div>
      </div>

      {/* Interactive Consultation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mood Selection & Preset Chips */}
        <div>
          <label
            htmlFor="moodInput"
            className="block font-sans text-xs font-semibold text-stone-300 tracking-wide mb-2.5 flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-[#f59e0b]" />
            <span>Player Mood & Session Intent</span>
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
                  className={`px-3.5 py-1.5 rounded-sm font-sans text-xs tracking-wide transition-all duration-200 border ${
                    isSelected
                      ? 'bg-[#24201d] text-[#fde68a] border-[#b45309] shadow-tactile-button font-bold scale-[1.02]'
                      : 'bg-[#141210] border-[#38312b] text-stone-400 hover:text-stone-200 hover:border-[#4a3e35]'
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
              className="w-full px-4 py-2.5 bg-[#141210] border border-[#38312b] rounded-sm font-sans text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-[#b45309] shadow-tactile-recessed transition-all"
            />
          </div>
        </div>

        {/* Time Slider with Visual Tick Marks */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="timeSlider"
              className="font-sans text-xs font-semibold text-stone-300 tracking-wide flex items-center gap-2"
            >
              <Clock className="w-4 h-4 text-[#f59e0b]" />
              <span>Available Session Duration</span>
            </label>
            <span
              data-testid="duration-display"
              className="font-serif font-bold text-sm text-[#f59e0b] px-3 py-0.5 bg-[#141210] border border-[#38312b] rounded-sm shadow-tactile-recessed"
            >
              {availableMinutes} MINS
            </span>
          </div>

          <div className="relative pt-1 pb-6">
            <input
              id="timeSlider"
              type="range"
              min={MIN_SESSION_MINUTES}
              max={MAX_SESSION_MINUTES}
              step={SESSION_STEP_MINUTES}
              value={availableMinutes}
              onChange={(e) => setAvailableMinutes(Number(e.target.value))}
              aria-label="Available session duration"
              className="w-full h-2 bg-[#141210] rounded-lg appearance-none cursor-pointer accent-[#b45309] border border-[#38312b] focus:outline-none focus:ring-1 focus:ring-[#f59e0b]/50 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#f59e0b] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#141210] [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(245,158,11,0.5)] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#f59e0b] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#141210] [&::-moz-range-thumb]:shadow-[0_0_8px_rgba(245,158,11,0.5)] [&::-moz-range-thumb]:cursor-pointer"
            />

            {/* Mathematically Aligned Visual Tick Marks & Labels */}
            <div className="relative w-full h-7 mt-1.5 pointer-events-none">
              {TIME_TICKS.map((tick) => {
                const fraction =
                  (tick - MIN_SESSION_MINUTES) / (MAX_SESSION_MINUTES - MIN_SESSION_MINUTES);
                const pct = fraction * 100;
                const isSelected = availableMinutes === tick;

                return (
                  <button
                    key={tick}
                    type="button"
                    onClick={() => setAvailableMinutes(tick)}
                    aria-label={`${tick} minutes`}
                    className="absolute -translate-x-1/2 flex flex-col items-center group cursor-pointer pointer-events-auto focus:outline-none"
                    style={{ left: `calc(${pct}% + ${(0.5 - fraction) * 16}px)` }}
                  >
                    <div
                      className={`w-0.5 h-1.5 rounded-full transition-colors ${
                        isSelected ? 'bg-[#f59e0b]' : 'bg-[#4a3e35] group-hover:bg-[#f59e0b]'
                      }`}
                    />
                    <span
                      className={`mt-1 font-sans text-[11px] whitespace-nowrap transition-colors ${
                        isSelected ? 'text-[#f59e0b] font-bold' : 'text-stone-500 group-hover:text-stone-300'
                      }`}
                    >
                      {tick}m
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recommendation Count Selector & Submit Action */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-5 border-t border-[#2e2823]">
          <div className="flex items-center gap-3">
            <label
              htmlFor="recommendationsCount"
              className="font-sans text-xs text-stone-400 tracking-wide flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-stone-500" />
              <span>Recommendations Limit:</span>
            </label>
            <select
              id="recommendationsCount"
              value={maxRecommendations}
              onChange={(e) => setMaxRecommendations(Number(e.target.value))}
              aria-label="Recommendations limit"
              className="px-3 py-1.5 bg-[#141210] border border-[#38312b] rounded-sm font-sans text-xs text-stone-200 focus:outline-none focus:border-[#b45309] shadow-tactile-recessed"
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
            className={`px-8 py-3 rounded-sm font-sans font-bold tracking-wide text-sm sm:text-base transition-all duration-200 flex items-center justify-center gap-2.5 border ${
              isTriaging || !hasBacklog
                ? 'bg-[#24201d] border-[#38312b] text-stone-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#8a1c14] via-[#b45309] to-[#c2410c] border-[#d97706]/40 text-stone-100 shadow-tactile-button hover:brightness-110 active:scale-[0.98]'
            }`}
          >
            {isTriaging ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-[#fbbf24]" />
                <span>CONSULTING GEMINI AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-[#fbbf24]" />
                <span>CONSULT ORACLE</span>
              </>
            )}
          </button>
        </div>

        {!hasBacklog && (
          <p className="font-sans text-xs text-[#f59e0b] text-center">
            * Please synchronize your Steam library first to enable AI triage consultation.
          </p>
        )}
      </form>

      {/* Synthesis Output: Dossier and Recommended Cards */}
      {triageResponse && (
        <div data-testid="triage-results" className="mt-8 pt-8 border-t border-[#38312b]">
          <div className="mb-5">
            <h3 className="font-serif font-bold text-2xl text-stone-100 tracking-wide">
              Recommended Backlog Candidates
            </h3>
            <p className="font-sans text-xs text-stone-400 mt-1">
              Curated selections tailored to your session criteria
            </p>
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
