import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { steamOracleApi, ProblemDetailError } from './api/steamOracleApi';
import { SyncSummaryResponse, SteamGameResponse, TriageResponse } from './types/steam';

vi.mock('./api/steamOracleApi', () => ({
  steamOracleApi: {
    syncLibrary: vi.fn(),
    getBacklog: vi.fn(),
    triageBacklog: vi.fn(),
  },
  ProblemDetailError: class extends Error {
    problem: any;
    constructor(problem: any) {
      super(problem.detail || problem.title);
      this.name = 'ProblemDetailError';
      this.problem = problem;
    }
  },
}));

describe('App Dashboard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSummary: SyncSummaryResponse = {
    steamId: '76561198000000000',
    totalImported: 20,
    totalUpdated: 5,
    backlogCount: 15,
  };

  const mockBacklog: SteamGameResponse[] = [
    {
      id: 1,
      steamId: '76561198000000000',
      appId: 1091500,
      name: 'Cyberpunk 2077',
      playtimeForeverMinutes: 45,
      imgIconUrl: 'cyberpunk.jpg',
      isBacklog: true,
    },
    {
      id: 2,
      steamId: '76561198000000000',
      appId: 1145360,
      name: 'Hades',
      playtimeForeverMinutes: 0,
      imgIconUrl: 'hades.jpg',
      isBacklog: true,
    },
  ];

  const mockTriageResponse: TriageResponse = {
    steamId: '76561198000000000',
    playerPersonaSummary: 'Immersion seeker eager for rich worldbuilding.',
    recommendations: [
      {
        appId: 1091500,
        name: 'Cyberpunk 2077',
        playtimeForeverMinutes: 45,
        imgIconUrl: 'cyberpunk.jpg',
        matchScore: 98,
        whyPlayNow: 'Night City atmosphere fits your evening session perfectly.',
        estimatedSessionMinutes: 60,
      },
    ],
  };

  it('renders initial dashboard structure and empty backlog prompt', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/SteamBacklog/i);
    expect(screen.getByText(/ORACLE SYNTHESIS MODULE/i)).toBeInTheDocument();
    expect(screen.getByText(/AWAITING LIBRARY SYNCHRONIZATION/i)).toBeInTheDocument();
  });

  it('completes library sync flow, updating telemetry and displaying backlog game cards', async () => {
    vi.mocked(steamOracleApi.syncLibrary).mockResolvedValue(mockSummary);
    vi.mocked(steamOracleApi.getBacklog).mockResolvedValue(mockBacklog);

    render(<App />);

    const syncButton = screen.getByRole('button', { name: /INITIALIZE SYNC/i });
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(screen.getByTestId('stat-total-imported')).toHaveTextContent('20');
      expect(screen.getByTestId('stat-updated')).toHaveTextContent('5');
      expect(screen.getByTestId('stat-backlog-queue')).toHaveTextContent('15');
    });

    expect(await screen.findByText('Cyberpunk 2077')).toBeInTheDocument();
    expect(screen.getByText('Hades')).toBeInTheDocument();
    expect(screen.getAllByText('UNTOUCHED').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('IN PROGRESS').length).toBeGreaterThanOrEqual(1);
  });

  it('completes AI triage consultation flow, displaying persona dossier and recommendations', async () => {
    vi.mocked(steamOracleApi.syncLibrary).mockResolvedValue(mockSummary);
    vi.mocked(steamOracleApi.getBacklog).mockResolvedValue(mockBacklog);
    vi.mocked(steamOracleApi.triageBacklog).mockResolvedValue(mockTriageResponse);

    render(<App />);

    // 1. Sync first to unlock backlog
    const syncButton = screen.getByRole('button', { name: /INITIALIZE SYNC/i });
    fireEvent.click(syncButton);

    await screen.findByText('Cyberpunk 2077');

    // 2. Select mood preset and consult Oracle
    const moodChip = screen.getByRole('button', { name: 'Deep Narrative RPG' });
    fireEvent.click(moodChip);

    const consultButton = screen.getByRole('button', { name: /CONSULT ORACLE/i });
    fireEvent.click(consultButton);

    await waitFor(() => {
      expect(screen.getByTestId('triage-results')).toBeInTheDocument();
      expect(screen.getByTestId('persona-dossier')).toBeInTheDocument();
      expect(
        screen.getByText(/Immersion seeker eager for rich worldbuilding./i)
      ).toBeInTheDocument();
      expect(screen.getByTestId('match-score-emblem')).toHaveTextContent('98% MATCH');
      expect(
        screen.getByText(/Night City atmosphere fits your evening session perfectly./i)
      ).toBeInTheDocument();
    });
  });

  it('displays RFC-7807 ErrorBanner when sync fails with an error', async () => {
    vi.mocked(steamOracleApi.syncLibrary).mockRejectedValue(
      new (ProblemDetailError as any)({
        title: 'Invalid Steam ID',
        status: 400,
        detail: 'The provided SteamID64 is invalid or malformed.',
      })
    );

    render(<App />);

    const syncButton = screen.getByRole('button', { name: /INITIALIZE SYNC/i });
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('HTTP 400')).toBeInTheDocument();
      expect(screen.getByText('Invalid Steam ID')).toBeInTheDocument();
      expect(
        screen.getByText('The provided SteamID64 is invalid or malformed.')
      ).toBeInTheDocument();
    });
  });
});
