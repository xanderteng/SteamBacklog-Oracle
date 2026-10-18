import React, { useState, useMemo } from 'react';
import { Gamepad2, Search, Filter, Layers } from 'lucide-react';
import { SteamGameResponse } from '../../types/steam';
import { GameCard } from './GameCard';
import { CornerBrackets } from '../Common/CornerBrackets';

interface BacklogGridProps {
  games: SteamGameResponse[];
  isLoading: boolean;
  hasSynced: boolean;
}

export const BacklogGrid: React.FC<BacklogGridProps> = ({
  games,
  isLoading,
  hasSynced,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNTOUCHED' | 'IN_PROGRESS'>('ALL');

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const matchesSearch = game.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'UNTOUCHED') {
        return game.playtimeForeverMinutes === 0;
      }
      if (statusFilter === 'IN_PROGRESS') {
        return game.playtimeForeverMinutes > 0;
      }
      return true;
    });
  }, [games, searchQuery, statusFilter]);

  if (isLoading) {
    return (
      <section
        data-testid="backlog-loading"
        className="relative p-12 bg-obsidian-950/60 border border-slate-800 rounded-sm text-center backdrop-blur-sm"
      >
        <CornerBrackets accentColor="text-neon-cyan/40" />
        <div className="inline-block p-4 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan animate-spin mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="font-display font-bold text-lg text-slate-200 tracking-wider uppercase">
          SCANNING BACKLOG VAULT...
        </h3>
        <p className="font-mono text-xs text-slate-400 mt-1">
          Querying local datastore for eligible titles (&lt; 120 mins playtime)
        </p>
      </section>
    );
  }

  if (games.length === 0) {
    return (
      <section
        data-testid="backlog-empty"
        className="relative p-12 bg-obsidian-950/60 border border-slate-800 rounded-sm text-center backdrop-blur-sm"
      >
        <CornerBrackets accentColor="text-neon-amber/40" />
        <div className="inline-block p-4 rounded-full bg-neon-amber/10 border border-neon-amber/30 text-neon-amber mb-4">
          <Gamepad2 className="w-10 h-10" />
        </div>
        <h3 className="font-display font-bold text-xl text-slate-100 tracking-wider uppercase mb-2">
          {hasSynced ? 'NO BACKLOG GAMES DETECTED' : 'AWAITING LIBRARY SYNCHRONIZATION'}
        </h3>
        <p className="font-mono text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          {hasSynced
            ? 'Your synchronized Steam library currently has 0 unplayed or low-playtime games under 120 minutes. All games in this account are cleared or above threshold!'
            : 'Enter a valid SteamID64 into the command console above and click INITIALIZE SYNC to import your catalog and activate backlog triage.'}
        </p>
      </section>
    );
  }

  return (
    <section data-testid="backlog-grid-section" className="mb-12">
      {/* Header Deck: Controls & Count */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl tracking-wider text-slate-100 uppercase">
              BACKLOG ARCHIVE
            </h2>
            <span className="font-mono text-[11px] text-slate-400">
              SHOWING {filteredGames.length} OF {games.length} REGISTERED TITLES
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Search */}
          <div className="relative flex items-center bg-obsidian-900 border border-slate-700 rounded-sm focus-within:border-neon-cyan">
            <Search className="w-3.5 h-3.5 text-slate-400 ml-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog..."
              aria-label="Search catalog"
              className="px-2.5 py-1.5 bg-transparent font-mono text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-36 sm:w-48"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1 bg-obsidian-900 p-1 border border-slate-800 rounded-sm font-mono text-[11px]">
            <Filter className="w-3 h-3 text-slate-500 ml-1 mr-0.5" />
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2 py-0.5 rounded-sm transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ALL
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('UNTOUCHED')}
              className={`px-2 py-0.5 rounded-sm transition-colors ${
                statusFilter === 'UNTOUCHED'
                  ? 'bg-neon-amber/20 text-neon-amber border border-neon-amber/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              UNTOUCHED
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-2 py-0.5 rounded-sm transition-colors ${
                statusFilter === 'IN_PROGRESS'
                  ? 'bg-neon-indigo/20 text-neon-indigo border border-neon-indigo/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              IN PROGRESS
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Collector Game Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredGames.map((game) => (
          <GameCard key={game.appId} game={game} />
        ))}
      </div>
    </section>
  );
};
