import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ProblemDetail } from '../../types/steam';
import { CornerBrackets } from './CornerBrackets';

interface ErrorBannerProps {
  problem: ProblemDetail | null;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ problem, onDismiss }) => {
  if (!problem) return null;

  return (
    <div
      role="alert"
      data-testid="error-banner"
      className="relative mb-6 p-4 bg-obsidian-950/90 border border-neon-crimson/50 shadow-glow-crimson backdrop-blur-md rounded-sm overflow-hidden"
    >
      <CornerBrackets accentColor="text-neon-crimson" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-1.5 rounded bg-neon-crimson/10 border border-neon-crimson/30 text-neon-crimson animate-pulse">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] tracking-widest px-1.5 py-0.5 rounded bg-neon-crimson/20 text-neon-crimson border border-neon-crimson/40">
                HTTP {problem.status}
              </span>
              <h3 className="font-display font-bold text-slate-100 uppercase tracking-wide text-sm sm:text-base">
                {problem.title}
              </h3>
            </div>

            <p className="font-mono text-xs text-slate-300 leading-relaxed">
              {problem.detail}
            </p>

            {problem.errors && problem.errors.length > 0 && (
              <ul className="mt-2 pl-4 list-disc font-mono text-[11px] text-neon-crimson/90 space-y-0.5">
                {problem.errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
