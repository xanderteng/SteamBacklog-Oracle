import React from 'react';
import { UserCheck, Sparkles } from 'lucide-react';

interface PersonaDossierProps {
  summary: string;
}

export const PersonaDossier: React.FC<PersonaDossierProps> = ({ summary }) => {
  return (
    <div
      data-testid="persona-dossier"
      className="relative mb-6 p-4 sm:p-5 bg-[#24201d] border border-[#38312b] rounded-sm shadow-tactile-card"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#38312b] text-xs font-sans">
        <div className="flex items-center gap-2 text-[#f59e0b]">
          <Sparkles className="w-4 h-4" />
          <span className="font-serif font-bold tracking-wide text-sm text-stone-100">
            Player Persona Profile
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[#1c1917] border border-[#38312b] text-stone-300 text-xs">
          <UserCheck className="w-3.5 h-3.5 text-[#f59e0b]" />
          <span>Active Dossier</span>
        </div>
      </div>

      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 p-2 rounded-sm bg-[#1c1917] border border-[#38312b] text-[#fbbf24] shrink-0 shadow-tactile-recessed">
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="font-serif font-medium text-sm sm:text-base text-stone-100 leading-relaxed italic">
          "{summary}"
        </p>
      </div>
    </div>
  );
};
