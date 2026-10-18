import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RecommendationCard } from '../RecommendationCard';
import { GameRecommendationDto } from '../../../types/steam';

describe('RecommendationCard Component', () => {
  const mockRecommendation: GameRecommendationDto = {
    appId: 1091500,
    name: 'Cyberpunk 2077',
    playtimeForeverMinutes: 45,
    imgIconUrl: 'cyberpunk.jpg',
    matchScore: 96,
    whyPlayNow: 'Deep immersive story fits your evening mood.',
    estimatedSessionMinutes: 60,
  };

  it('renders title, app ID, and match score emblem', () => {
    render(<RecommendationCard recommendation={mockRecommendation} rank={1} />);

    expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument();
    expect(screen.getByText(/APP_ID #1091500/i)).toBeInTheDocument();
    expect(screen.getByTestId('match-score-emblem')).toHaveTextContent('96% MATCH');
  });

  it('renders session duration pill and tactical briefing box', () => {
    render(<RecommendationCard recommendation={mockRecommendation} rank={1} />);

    expect(screen.getByTestId('session-duration-pill')).toHaveTextContent('EST. 60 MIN SESSION');
    expect(screen.getByTestId('tactical-briefing-box')).toHaveTextContent(
      'Deep immersive story fits your evening mood.'
    );
  });

  it('falls back to stylized placeholder graphic when capsule image fails', () => {
    render(<RecommendationCard recommendation={mockRecommendation} rank={1} />);

    const img = screen.getByRole('img');
    fireEvent.error(img);

    expect(screen.getByTestId('recommendation-fallback-art')).toBeInTheDocument();
  });
});
