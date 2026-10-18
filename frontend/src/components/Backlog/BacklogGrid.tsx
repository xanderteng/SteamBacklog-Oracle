import React, { useState, useMemo } from 'react';
import { Gamepad2, Search, Filter, Layers } from 'lucide-react';
import { SteamGameResponse } from '../../types/steam';
import { GameCard } from './GameCard';

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
        className="relative p-12 bg-[#1c1917] border border-[#38312b] rounded-sm text-center shadow-tactile-card"
      >
        <div className="inline-block p-4 rounded-full bg-[#24201d] border border-[#38312b] text-[#f59e0b] animate-spin mb-4">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="font-serif font-bold text-xl text-stone-100 tracking-wide">
          Scanning Backlog Vault...
        </h3>
        <p className="font-sans text-xs text-stone-400 mt-1.5 max-w-sm mx-auto">
          Querying archive for eligible backlog games under 120 minutes of playtime.
        </p>
      </section>
    );
  }

  if (games.length === 0) {
    return (
      <section
        data-testid="backlog-empty"
        className="relative p-12 bg-[#1c1917] border border-[#38312b] rounded-sm text-center shadow-tactile-card"
      >
        <div className="inline-block p-4 rounded-full bg-[#24201d] border border-[#38312b] text-[#f59e0b] mb-4">
          <Gamepad2 className="w-10 h-10" />
        </div>
        <h3 className="font-serif font-bold text-xl sm:text-2xl text-stone-100 tracking-wide mb-2">
          {hasSynced ? 'No Backlog Games Detected' : 'Awaiting Library Synchronization'}
        </h3>
        <p className="font-sans text-xs text-stone-400 max-w-md mx-auto leading-relaxed">
          {hasSynced
            ? 'Your synchronized Steam library currently has 0 unplayed or low-playtime games under 120 minutes. All games in this account are cleared or above threshold!'
            : 'Enter a valid Steam ID into the console above and synchronize your catalog to curate your unplayed games.'}
        </p>
      </section>
    );
  }

  return (
    <section data-testid="backlog-grid-section" className="mb-12">
      {/* Header Deck: Controls & Count */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#2e2823]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-sm bg-[#24201d] border border-[#38312b] text-[#f59e0b] shadow-tactile-recessed">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-bold text-xl tracking-wide text-stone-100">
              Backlog Archive
            </h2>
            <span className="font-sans text-xs text-stone-400">
              Curating {filteredGames.length} of {games.length} unplayed titles
            </span>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Search */}
          <div className="relative flex items-center bg-[#141210] border border-[#38312b] rounded-sm focus-within:border-[#b45309] shadow-tactile-recessed">
            <Search className="w-3.5 h-3.5 text-stone-400 ml-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog..."
              aria-label="Search catalog"
              className="px-2.5 py-1.5 bg-transparent font-sans text-xs text-stone-200 placeholder-stone-500 focus:outline-none w-36 sm:w-48"
            />
          </div>

          {/* Status Filter Chips */}
          <div className="flex items-center gap-1 bg-[#141210] p-1 border border-[#38312b] rounded-sm font-sans text-xs shadow-tactile-recessed">
            <Filter className="w-3 h-3 text-stone-500 ml-1.5 mr-0.5" />
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-0.5 rounded-sm transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-[#24201d] text-stone-100 border border-[#4a3e35] font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('UNTOUCHED')}
              className={`px-2.5 py-0.5 rounded-sm transition-colors ${
                statusFilter === 'UNTOUCHED'
                  ? 'bg-[#7f1d1d]/40 text-[#fca5a5] border border-[#991b1b] font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Untouched
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('IN_PROGRESS')}
              className={`px-2.5 py-0.5 rounded-sm transition-colors ${
                statusFilter === 'IN_PROGRESS'
                  ? 'bg-[#78350f]/40 text-[#fde68a] border border-[#b45309] font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              In Progress
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Collector Game Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {filteredGames.map((game) => (
          <GameCard key={game.appId} game={game} />
        ))}
      </div>
    </section>
  );
};
