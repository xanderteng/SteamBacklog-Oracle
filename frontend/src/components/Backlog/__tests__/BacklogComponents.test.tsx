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
  };

  const mockGameInProgress: SteamGameResponse = {
    id: 2,
    steamId: '76561198000000000',
    appId: 1145360,
    name: 'Hades',
    playtimeForeverMinutes: 60,
    imgIconUrl: 'hades.jpg',
    isBacklog: true,
  };

  describe('GameCard', () => {
    it('renders telemetry strip, title, and UNTOUCHED status badge for 0 playtime', () => {
      render(<GameCard game={mockGameUntouched} />);

      expect(screen.getByText(/APP_ID/)).toBeInTheDocument();
      expect(screen.getByText(/#1091500/)).toBeInTheDocument();
      expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument();
      expect(screen.getByText('UNTOUCHED')).toBeInTheDocument();
      expect(screen.getByTestId('segmented-progress-bar')).toBeInTheDocument();
    });

    it('renders IN PROGRESS status badge for positive playtime under 120 mins', () => {
      render(<GameCard game={mockGameInProgress} />);

      expect(screen.getByText('IN PROGRESS')).toBeInTheDocument();
      expect(screen.getByLabelText(/Playtime 60 of 120 minutes/i)).toBeInTheDocument();
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
      expect(screen.getByText(/SCANNING BACKLOG VAULT/i)).toBeInTheDocument();
    });

    it('renders empty state prompt when no games are present', () => {
      render(<BacklogGrid games={[]} isLoading={false} hasSynced={false} />);
      expect(screen.getByTestId('backlog-empty')).toBeInTheDocument();
      expect(screen.getByText(/AWAITING LIBRARY SYNCHRONIZATION/i)).toBeInTheDocument();
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

      const untouchedFilter = screen.getByRole('button', { name: 'UNTOUCHED' });
      fireEvent.click(untouchedFilter);

      expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument();
      expect(screen.queryByText('Hades')).not.toBeInTheDocument();
    });
  });
});
