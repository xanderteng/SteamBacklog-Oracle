import React, { useState } from 'react';
import { AmbientCanvas } from './components/Common/AmbientCanvas';
import { ErrorBanner } from './components/Common/ErrorBanner';
import { CommandHeader } from './components/Header/CommandHeader';
import { OraclePanel } from './components/Oracle/OraclePanel';
import { BacklogGrid } from './components/Backlog/BacklogGrid';
import {
  SteamGameResponse,
  SyncSummaryResponse,
  TriageRequest,
  TriageResponse,
  ProblemDetail,
} from './types/steam';
import { steamOracleApi, ProblemDetailError } from './api/steamOracleApi';

export default function App() {
  const [steamId, setSteamId] = useState('76561198000000000');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingBacklog, setIsLoadingBacklog] = useState(false);
  const [isTriaging, setIsTriaging] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  const [syncSummary, setSyncSummary] = useState<SyncSummaryResponse | null>(null);
  const [backlogGames, setBacklogGames] = useState<SteamGameResponse[]>([]);
  const [triageResponse, setTriageResponse] = useState<TriageResponse | null>(null);
  const [activeError, setActiveError] = useState<ProblemDetail | null>(null);

  const handleSync = async () => {
    if (!steamId.trim()) return;
    setIsSyncing(true);
    setActiveError(null);

    try {
      const summary = await steamOracleApi.syncLibrary(steamId);
      setSyncSummary(summary);
      setHasSynced(true);

      // Refresh backlog
      setIsLoadingBacklog(true);
      try {
        const games = await steamOracleApi.getBacklog(steamId);
        setBacklogGames(games);
      } catch (backlogErr) {
        if (backlogErr instanceof ProblemDetailError) {
          setActiveError(backlogErr.problem);
        } else {
          setActiveError({
            status: 500,
            title: 'Backlog Fetch Error',
            detail: (backlogErr as Error).message || 'Failed to fetch backlog games',
          });
        }
      } finally {
        setIsLoadingBacklog(false);
      }
    } catch (err) {
      if (err instanceof ProblemDetailError) {
        setActiveError(err.problem);
      } else {
        setActiveError({
          status: 500,
          title: 'Sync Library Error',
          detail: (err as Error).message || 'Failed to communicate with sync endpoint',
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleTriage = async (request: TriageRequest) => {
    if (!steamId.trim()) return;
    setIsTriaging(true);
    setActiveError(null);

    try {
      const response = await steamOracleApi.triageBacklog(steamId, request);
      setTriageResponse(response);
    } catch (err) {
      if (err instanceof ProblemDetailError) {
        setActiveError(err.problem);
      } else {
        setActiveError({
          status: 502,
          title: 'Oracle Triage Error',
          detail: (err as Error).message || 'Failed to consult AI Oracle',
        });
      }
    } finally {
      setIsTriaging(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-obsidian-900 text-slate-100 font-sans selection:bg-neon-cyan/20 selection:text-neon-cyan">
      {/* Multi-Layered Ambient Canvas (fixed behind content) */}
      <AmbientCanvas />

      {/* Main HUD Cockpit Wrapper */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Diagnostic RFC-7807 Error Banner */}
        <ErrorBanner
          problem={activeError}
          onDismiss={() => setActiveError(null)}
        />

        {/* Cockpit Command Header */}
        <CommandHeader
          steamId={steamId}
          onSteamIdChange={setSteamId}
          onSync={handleSync}
          isSyncing={isSyncing}
          syncSummary={syncSummary}
        />

        {/* AI Oracle Synthesis Module */}
        <OraclePanel
          onTriage={handleTriage}
          isTriaging={isTriaging}
          triageResponse={triageResponse}
          hasBacklog={backlogGames.length > 0}
        />

        {/* Backlog Archive Collector Grid */}
        <BacklogGrid
          games={backlogGames}
          isLoading={isLoadingBacklog}
          hasSynced={hasSynced}
        />

        {/* Cockpit Footer Trim */}
        <footer className="mt-16 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan/60" />
            <span>STEAMBACKLOG ORACLE // TACTICAL MIDIMALIST CLIENT</span>
          </div>
          <div className="text-right">
            <span>SPRING BOOT 3.3.4 + REACT 18 + GEMINI 2.5 FLASH</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
