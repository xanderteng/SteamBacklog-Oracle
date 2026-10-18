import React from 'react';
import { Database, RefreshCw, Gamepad2, Radio, Sparkles } from 'lucide-react';
import { CornerBrackets } from '../Common/CornerBrackets';
import { StatCard } from '../Common/StatCard';
import { SyncSummaryResponse } from '../../types/steam';

interface CommandHeaderProps {
  steamId: string;
  onSteamIdChange: (steamId: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  syncSummary: SyncSummaryResponse | null;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  steamId,
  onSteamIdChange,
  onSync,
  isSyncing,
  syncSummary,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (steamId.trim() && !isSyncing) {
      onSync();
    }
  };

  return (
    <header className="relative mb-8 bg-obsidian-950/70 border border-slate-800/80 rounded-sm p-4 sm:p-6 backdrop-blur-md shadow-2xl">
      <CornerBrackets accentColor="text-neon-cyan/40" size="w-3.5 h-3.5" />

      {/* Top Deck: Branding and Telemetry Status LED */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-neon-cyan/10 border border-neon-cyan/40 rounded shadow-glow-cyan">
            <Gamepad2 className="w-6 h-6 text-neon-cyan" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-2xl sm:text-3xl tracking-widest text-slate-100 uppercase">
                SteamBacklog <span className="text-neon-cyan font-extrabold">// ORACLE</span>
              </h1>
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 uppercase tracking-widest">
                v1.0.0
              </span>
            </div>
            <p className="font-mono text-xs text-slate-400 tracking-wider">
              TACTICAL BACKLOG TRIAGE & AI SYNTHESIS TERMINAL
            </p>
          </div>
        </div>

        {/* Tactical Status LED Banner */}
        <div className="flex items-center gap-3 px-3 py-1.5 bg-obsidian-900 border border-neon-emerald/30 rounded font-mono text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-emerald opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-emerald" />
          </span>
          <span className="text-neon-emerald tracking-widest uppercase font-semibold text-[11px] flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5" /> SYSTEM OPERATIONAL // REST-AI ACTIVE
          </span>
        </div>
      </div>

      {/* Middle Deck: Input Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Framed Steam ID Input Group */}
          <div className="relative flex-1 flex rounded-sm border border-slate-700 bg-obsidian-900 focus-within:border-neon-cyan focus-within:shadow-glow-cyan transition-all">
            <span className="inline-flex items-center px-3 font-mono text-xs text-neon-cyan/80 bg-obsidian-800/80 border-r border-slate-700 uppercase tracking-widest select-none">
              STEAM_ID_64
            </span>
            <input
              type="text"
              id="steamIdInput"
              value={steamId}
              onChange={(e) => onSteamIdChange(e.target.value)}
              placeholder="e.g. 76561198000000000"
              aria-label="Steam ID 64"
              className="w-full px-3.5 py-2.5 bg-transparent font-mono text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {/* Gradient Beveled Action Button */}
          <button
            type="submit"
            disabled={!steamId.trim() || isSyncing}
            className={`relative group px-6 py-2.5 rounded-sm font-display font-bold uppercase tracking-widest text-sm transition-all duration-300 flex items-center justify-center gap-2 border ${
              isSyncing
                ? 'bg-obsidian-800 border-slate-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-neon-cyan/20 via-neon-indigo/30 to-neon-cyan/20 border-neon-cyan/60 text-neon-cyan hover:border-neon-cyan hover:shadow-glow-cyan hover:from-neon-cyan/30 hover:to-neon-indigo/40 active:scale-[0.98]'
            }`}
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-neon-cyan" />
                <span>SYNCHRONIZING...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>INITIALIZE SYNC</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Bottom Deck: 3 Framed Telemetry Stat Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="TOTAL IMPORTED"
          value={syncSummary?.totalImported ?? '---'}
          icon={Database}
          accent="amber"
          testId="stat-total-imported"
        />
        <StatCard
          label="UPDATED"
          value={syncSummary?.totalUpdated ?? '---'}
          icon={RefreshCw}
          accent="indigo"
          testId="stat-updated"
        />
        <StatCard
          label="BACKLOG QUEUE"
          value={syncSummary?.backlogCount ?? '---'}
          icon={Gamepad2}
          accent="cyan"
          testId="stat-backlog-queue"
        />
      </div>
    </header>
  );
};
