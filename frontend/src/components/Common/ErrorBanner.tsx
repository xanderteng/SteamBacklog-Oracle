import React from 'react';
import { AlertCircle, X } from 'lucide-react';
import { ProblemDetail } from '../../types/steam';

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
      className="relative mb-6 p-4 bg-[#1f1917] border border-[#7f1d1d] shadow-tactile-card rounded-sm overflow-hidden"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-2 rounded-sm bg-[#7f1d1d]/25 border border-[#991b1b]/50 text-[#fca5a5]">
            <AlertCircle className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-sans text-[11px] font-semibold px-2 py-0.5 rounded-sm bg-[#7f1d1d]/30 text-[#fca5a5] border border-[#991b1b]/40">
                HTTP {problem.status}
              </span>
              <h3 className="font-serif font-bold text-stone-100 tracking-wide text-sm sm:text-base">
                {problem.title}
              </h3>
            </div>

            <p className="font-sans text-xs text-stone-300 leading-relaxed">
              {problem.detail}
            </p>

            {problem.errors && problem.errors.length > 0 && (
              <ul className="mt-2 pl-4 list-disc font-sans text-xs text-[#fca5a5] space-y-0.5">
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
            className="p-1 rounded text-stone-400 hover:text-stone-100 hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
