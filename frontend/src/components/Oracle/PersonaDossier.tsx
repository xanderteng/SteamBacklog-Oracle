import React from 'react';
import { UserCheck, Sparkles, Terminal } from 'lucide-react';
import { CornerBrackets } from '../Common/CornerBrackets';

interface PersonaDossierProps {
  summary: string;
}

export const PersonaDossier: React.FC<PersonaDossierProps> = ({ summary }) => {
  return (
    <div
      data-testid="persona-dossier"
      className="relative mb-6 p-4 sm:p-5 bg-obsidian-950/90 border border-neon-indigo/50 rounded-sm shadow-glow-indigo backdrop-blur-md"
    >
      <CornerBrackets accentColor="text-neon-indigo" size="w-3 h-3" />

      <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-neon-indigo/20 text-xs font-mono">
        <div className="flex items-center gap-2 text-neon-indigo">
          <Terminal className="w-4 h-4 text-neon-cyan" />
          <span className="font-bold tracking-widest text-[11px] uppercase">
            ORACLE DOSSIER // SYNTHESIZED PLAYER PROFILE
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-neon-indigo/15 text-neon-indigo border border-neon-indigo/30 text-[10px] tracking-wider uppercase font-semibold">
          <UserCheck className="w-3 h-3" />
          <span>PROFILE ACTIVE</span>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="mt-1 p-2 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <p className="font-display font-medium text-sm sm:text-base text-slate-100 leading-relaxed tracking-wide italic">
          "{summary}"
        </p>
      </div>
    </div>
  );
};
