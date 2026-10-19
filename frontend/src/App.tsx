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
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [isTriaging, setIsTriaging] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  const [savedUsers, setSavedUsers] = useState<string[]>([]);
  const [syncSummary, setSyncSummary] = useState<SyncSummaryResponse | null>(null);
  const [backlogGames, setBacklogGames] = useState<SteamGameResponse[]>([]);
  const [triageResponse, setTriageResponse] = useState<TriageResponse | null>(null);
  const [activeError, setActiveError] = useState<ProblemDetail | null>(null);

  React.useEffect(() => {
    steamOracleApi
      .getSavedUsers()
      .then((users) => {
        if (users && users.length > 0) {
          setSavedUsers(users);
          // If default steamId is not one of the saved ones, pick the latest saved one
          setSteamId((prev) => (users.includes(prev) ? prev : users[users.length - 1]));
        }
      })
      .catch(() => {
        // Silently ignore if server is still starting
      });
  }, []);

  const handleLoadSaved = async (targetSteamId?: string) => {
    const idToLoad = (targetSteamId || steamId).trim();
    if (!idToLoad) return;
    setIsLoadingSaved(true);
    setIsLoadingBacklog(true);
    setActiveError(null);

    try {
      const [summary, games] = await Promise.all([
        steamOracleApi.getSavedSummary(idToLoad),
        steamOracleApi.getBacklog(idToLoad),
      ]);
      setSyncSummary(summary);
      setBacklogGames(games);
      setHasSynced(true);
    } catch (err) {
      if (err instanceof ProblemDetailError) {
        setActiveError(err.problem);
      } else {
        setActiveError({
          status: 404,
          title: 'Vault Load Error',
          detail: (err as Error).message || 'No saved games found for this Steam ID in the database.',
        });
      }
    } finally {
      setIsLoadingSaved(false);
      setIsLoadingBacklog(false);
    }
  };

  const handleSync = async () => {
    if (!steamId.trim()) return;
    setIsSyncing(true);
    setActiveError(null);

    try {
      const summary = await steamOracleApi.syncLibrary(steamId);
      setSyncSummary(summary);
      setHasSynced(true);

      // Refresh saved users list
      steamOracleApi.getSavedUsers().then(setSavedUsers).catch(() => {});

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
    <div className="relative min-h-screen bg-[#11100f] text-stone-100 font-sans selection:bg-amber-900/40 selection:text-amber-200">
      {/* Multi-Layered Textured Ambient Canvas (fixed behind content) */}
      <AmbientCanvas />

      {/* Main Collector Atelier Wrapper */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Diagnostic RFC-7807 Error Banner */}
        <ErrorBanner
          problem={activeError}
          onDismiss={() => setActiveError(null)}
        />

        {/* Collector Atelier Header */}
        <CommandHeader
          steamId={steamId}
          onSteamIdChange={setSteamId}
          onSync={handleSync}
          isSyncing={isSyncing}
          syncSummary={syncSummary}
          savedUsers={savedUsers}
          onLoadSaved={handleLoadSaved}
          isLoadingSaved={isLoadingSaved}
        />

        {/* AI Oracle Consultation Atelier */}
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

        {/* Atelier Footer */}
        <footer className="mt-16 pt-8 border-t border-[#2e2823] flex flex-col sm:flex-row items-center justify-between text-xs font-sans text-stone-500 gap-3">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#b45309]" />
            <span className="text-stone-400">SteamBacklog Oracle: Tactile Collector's Atelier</span>
          </div>
          <div className="text-right text-stone-500">
            <span>Curated Backlog Intelligence with Spring Boot & Gemini AI</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
