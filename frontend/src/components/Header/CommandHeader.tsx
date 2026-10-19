import React from 'react';
import { Database, RefreshCw, Gamepad2, Sparkles, BookOpen } from 'lucide-react';
import { StatCard } from '../Common/StatCard';
import { SyncSummaryResponse } from '../../types/steam';

interface CommandHeaderProps {
  steamId: string;
  onSteamIdChange: (steamId: string) => void;
  onSync: () => void;
  isSyncing: boolean;
  syncSummary: SyncSummaryResponse | null;
  savedUsers?: string[];
  onLoadSaved?: (id: string) => void;
  isLoadingSaved?: boolean;
}

export const CommandHeader: React.FC<CommandHeaderProps> = ({
  steamId,
  onSteamIdChange,
  onSync,
  isSyncing,
  syncSummary,
  savedUsers = [],
  onLoadSaved,
  isLoadingSaved = false,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (steamId.trim() && !isSyncing) {
      onSync();
    }
  };

  return (
    <header className="relative mb-8 bg-[#1c1917] border border-[#38312b] rounded-sm p-5 sm:p-7 shadow-tactile-card backdrop-blur-sm">
      {/* Top Deck: Editorial Branding & Atelier Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#2e2823] mb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-[#24201d] border border-[#38312b] rounded-sm shadow-tactile-recessed text-[#fbbf24]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl tracking-wide text-stone-100">
              SteamBacklog <span className="text-[#f59e0b] italic font-normal">Oracle</span>
            </h1>
            <p className="font-sans text-xs text-stone-400 tracking-wide mt-0.5">
              Tactile Backlog Curation & AI Consultation Atelier
            </p>
          </div>
        </div>

        {/* Atelier Status Plaque */}
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-[#24201d] border border-[#38312b] rounded-sm font-sans text-xs text-stone-300 shadow-tactile-recessed">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-medium tracking-wide text-stone-300">
            Library Archive Ready
          </span>
        </div>
      </div>

      {/* Middle Deck: Input Form & Saved Vault Selectors */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Framed Steam ID Input Group */}
          <div className="relative flex-1 flex rounded-sm border border-[#38312b] bg-[#141210] focus-within:border-[#b45309] focus-within:ring-1 focus-within:ring-[#b45309]/40 shadow-tactile-recessed transition-all">
            <span className="inline-flex items-center px-4 font-sans text-xs font-semibold text-stone-400 bg-[#1c1917] border-r border-[#38312b] select-none">
              Steam ID
            </span>
            <input
              type="text"
              id="steamIdInput"
              value={steamId}
              onChange={(e) => onSteamIdChange(e.target.value)}
              placeholder="e.g. 76561198000000000"
              aria-label="Steam ID 64"
              className="w-full px-4 py-2.5 bg-transparent font-sans text-sm text-stone-100 placeholder-stone-600 focus:outline-none"
            />
          </div>

          {/* Quick Load Saved Vault Button */}
          {onLoadSaved && (
            <button
              type="button"
              onClick={() => onLoadSaved(steamId)}
              disabled={!steamId.trim() || isSyncing || isLoadingSaved}
              className={`px-5 py-2.5 rounded-sm font-sans font-bold tracking-wide text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 border ${
                isLoadingSaved || !steamId.trim()
                  ? 'bg-[#24201d] border-[#38312b] text-stone-500 cursor-not-allowed'
                  : 'bg-[#24201d] border-[#38312b] text-stone-200 hover:text-stone-100 hover:border-[#b45309] shadow-tactile-button hover:brightness-110 active:scale-[0.98]'
              }`}
            >
              {isLoadingSaved ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#fbbf24]" />
                  <span>LOADING VAULT...</span>
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 text-[#fbbf24]" />
                  <span>LOAD SAVED VAULT</span>
                </>
              )}
            </button>
          )}

          {/* Physical Embossed Action Button: Full Sync */}
          <button
            type="submit"
            disabled={!steamId.trim() || isSyncing || isLoadingSaved}
            className={`relative px-7 py-2.5 rounded-sm font-sans font-bold tracking-wide text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 border ${
              isSyncing
                ? 'bg-[#24201d] border-[#38312b] text-stone-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-[#8a1c14] via-[#b45309] to-[#c2410c] border-[#d97706]/40 text-stone-100 shadow-tactile-button hover:brightness-110 active:scale-[0.98]'
            }`}
          >
            {isSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#fbbf24]" />
                <span>SYNCHRONIZING...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#fbbf24]" />
                <span>INITIALIZE SYNC</span>
              </>
            )}
          </button>
        </div>

        {/* Saved Profiles Quick-Select Ribbon */}
        {savedUsers.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 font-sans text-xs text-stone-400">
            <span className="flex items-center gap-1.5 text-stone-500">
              <Database className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Saved in Vault:</span>
            </span>
            {savedUsers.map((uid) => {
              const isCurrent = steamId === uid;
              return (
                <button
                  key={uid}
                  type="button"
                  onClick={() => {
                    onSteamIdChange(uid);
                    if (onLoadSaved) {
                      onLoadSaved(uid);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-sm border transition-all text-[11px] font-mono ${
                    isCurrent
                      ? 'bg-[#2e2823] border-[#b45309] text-[#fde68a] font-semibold'
                      : 'bg-[#141210] border-[#38312b] text-stone-400 hover:border-[#b45309] hover:text-stone-200'
                  }`}
                  title={`Quick load library for ${uid}`}
                >
                  {uid}
                </button>
              );
            })}
          </div>
        )}
      </form>

      {/* Bottom Deck: 3 Framed Tactile Stat Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <StatCard
          label="Total Imported"
          value={syncSummary?.totalImported ?? '---'}
          icon={Database}
          accent="amber"
          testId="stat-total-imported"
        />
        <StatCard
          label="Updated"
          value={syncSummary?.totalUpdated ?? '---'}
          icon={RefreshCw}
          accent="gold"
          testId="stat-updated"
        />
        <StatCard
          label="Backlog Queue"
          value={syncSummary?.backlogCount ?? '---'}
          icon={Gamepad2}
          accent="terracotta"
          testId="stat-backlog-queue"
        />
      </div>
    </header>
  );
};
