import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GameCard } from '../GameCard';
import { BacklogGrid } from '../BacklogGrid';
import { SteamGameResponse } from '../../../types/steam';

describe('Backlog Components', () => {
  const mockGameUntouched: SteamGameResponse = {
    id: 1,
    steamId: '76561198000000000',
    appId: 1091500,
    name: 'Cyberpunk 2077',
    playtimeForeverMinutes: 0,
    imgIconUrl: 'cyberpunk.jpg',
    isBacklog: true,
    estimatedClearMinutes: 480,
    achievementsUnlocked: 0,
    achievementsTotal: 0,
    achievementPercentage: 0.0,
    completionStatus: 'UNTOUCHED',
  };

  const mockGameInProgress: SteamGameResponse = {
    id: 2,
    steamId: '76561198000000000',
    appId: 1145360,
    name: 'Hades',
    playtimeForeverMinutes: 60,
    imgIconUrl: 'hades.jpg',
    isBacklog: true,
    estimatedClearMinutes: 600,
    achievementsUnlocked: 10,
    achievementsTotal: 40,
    achievementPercentage: 25.0,
    completionStatus: 'IN_PROGRESS',
  };

  describe('GameCard', () => {
    it('renders clean app ID badge, title, and Untouched status pill for 0 playtime', () => {
      render(<GameCard game={mockGameUntouched} />);

      expect(screen.getByText('#1091500')).toBeInTheDocument();
      expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument();
      expect(screen.getByText('Untouched')).toBeInTheDocument();
      expect(screen.getByTestId('segmented-progress-bar')).toBeInTheDocument();
      expect(screen.getByText(/0h/i)).toBeInTheDocument();
      expect(screen.getByText(/\/ 8h avg to beat/i)).toBeInTheDocument();
    });

    it('renders In Progress status badge, achievement pill, and dynamic progress', () => {
      render(<GameCard game={mockGameInProgress} />);

      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByLabelText(/Playtime 60 of 600 minutes/i)).toBeInTheDocument();
      expect(screen.getByTestId('achievement-pill')).toHaveTextContent(/10 \/ 40 Achievements • 25%/i);
      expect(screen.getByText(/1h/i)).toBeInTheDocument();
      expect(screen.getByText(/\/ 10h avg to beat/i)).toBeInTheDocument();
    });

    it('displays fallback graphic when image fails to load', () => {
      render(<GameCard game={mockGameUntouched} />);

      const img = screen.getByRole('img');
      fireEvent.error(img);

      expect(screen.getByTestId('game-fallback-art')).toBeInTheDocument();
    });
  });

  describe('BacklogGrid', () => {
    it('renders loading state when isLoading is true', () => {
      render(<BacklogGrid games={[]} isLoading={true} hasSynced={false} />);
      expect(screen.getByTestId('backlog-loading')).toBeInTheDocument();
      expect(screen.getByText(/Scanning Backlog Vault/i)).toBeInTheDocument();
    });

    it('renders empty state prompt when no games are present', () => {
      render(<BacklogGrid games={[]} isLoading={false} hasSynced={false} />);
      expect(screen.getByTestId('backlog-empty')).toBeInTheDocument();
      expect(screen.getByText(/Awaiting Library Synchronization/i)).toBeInTheDocument();
    });

    it('renders game cards and filters by search query', () => {
      render(
        <BacklogGrid
          games={[mockGameUntouched, mockGameInProgress]}
          isLoading={false}
          hasSynced={true}
        />
      );

      expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument();
      expect(screen.getByText('Hades')).toBeInTheDocument();

      const searchInput = screen.getByLabelText(/Search catalog/i);
      fireEvent.change(searchInput, { target: { value: 'Hades' } });

      expect(screen.queryByText('Cyberpunk 2077')).not.toBeInTheDocument();
      expect(screen.getByText('Hades')).toBeInTheDocument();
    });

    it('filters by status chips', () => {
      render(
        <BacklogGrid
          games={[mockGameUntouched, mockGameInProgress]}
          isLoading={false}
          hasSynced={true}
        />
      );

      const untouchedFilter = screen.getByRole('button', { name: /Untouched/i });
      fireEvent.click(untouchedFilter);

      expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument();
      expect(screen.queryByText('Hades')).not.toBeInTheDocument();
    });
  });
});
