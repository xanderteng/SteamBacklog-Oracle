import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OraclePanel } from '../OraclePanel';
import { PersonaDossier } from '../PersonaDossier';
import { TriageResponse } from '../../../types/steam';

describe('Oracle Components', () => {
  describe('PersonaDossier', () => {
    it('renders persona summary text', () => {
      render(<PersonaDossier summary="Fast-paced rogue-lite enthusiast." />);
      expect(screen.getByTestId('persona-dossier')).toBeInTheDocument();
      expect(screen.getByText(/"Fast-paced rogue-lite enthusiast."/i)).toBeInTheDocument();
    });
  });

  describe('OraclePanel', () => {
    const mockTriageResponse: TriageResponse = {
      steamId: '76561198000000000',
      playerPersonaSummary: 'Strategic mastermind.',
      recommendations: [
        {
          appId: 1091500,
          name: 'Cyberpunk 2077',
          playtimeForeverMinutes: 45,
          imgIconUrl: 'cyberpunk.jpg',
          matchScore: 95,
          whyPlayNow: 'Deep story fits well.',
          estimatedSessionMinutes: 60,
        },
      ],
    };

    it('renders Oracle module header and mood presets', () => {
      render(
        <OraclePanel
          onTriage={vi.fn()}
          isTriaging={false}
          triageResponse={null}
          hasBacklog={true}
        />
      );

      expect(screen.getByText(/Oracle Consultation Atelier/i)).toBeInTheDocument();
      expect(screen.getByText('Cozy & Low Energy')).toBeInTheDocument();
      expect(screen.getByText('Strategic Mastery')).toBeInTheDocument();
    });

    it('updates mood input when clicking a mood preset chip', () => {
      render(
        <OraclePanel
          onTriage={vi.fn()}
          isTriaging={false}
          triageResponse={null}
          hasBacklog={true}
        />
      );

      const chip = screen.getByRole('button', { name: 'Deep Narrative RPG' });
      fireEvent.click(chip);

      const input = screen.getByLabelText(/Player mood/i) as HTMLInputElement;
      expect(input.value).toBe('Deep Narrative RPG');
    });

    it('updates available minutes duration display on slider change', () => {
      render(
        <OraclePanel
          onTriage={vi.fn()}
          isTriaging={false}
          triageResponse={null}
          hasBacklog={true}
        />
      );

      const slider = screen.getByLabelText(/Available session duration/i);
      fireEvent.change(slider, { target: { value: '90' } });

      expect(screen.getByTestId('duration-display')).toHaveTextContent('90 MINS');
    });

    it('triggers onTriage with selected options on form submit', () => {
      const onTriage = vi.fn();
      render(
        <OraclePanel
          onTriage={onTriage}
          isTriaging={false}
          triageResponse={null}
          hasBacklog={true}
        />
      );

      const button = screen.getByRole('button', { name: /CONSULT ORACLE/i });
      fireEvent.click(button);

      expect(onTriage).toHaveBeenCalledWith({
        mood: 'High-Octane Action',
        availableMinutes: 45,
        maxRecommendations: 3,
      });
    });

    it('disables submit when hasBacklog is false and shows warning prompt', () => {
      render(
        <OraclePanel
          onTriage={vi.fn()}
          isTriaging={false}
          triageResponse={null}
          hasBacklog={false}
        />
      );

      const button = screen.getByRole('button', { name: /CONSULT ORACLE/i });
      expect(button).toBeDisabled();
      expect(screen.getByText(/Please synchronize your Steam library first/i)).toBeInTheDocument();
    });

    it('renders dossier and recommendation cards when triageResponse is present', () => {
      render(
        <OraclePanel
          onTriage={vi.fn()}
          isTriaging={false}
          triageResponse={mockTriageResponse}
          hasBacklog={true}
        />
      );

      expect(screen.getByTestId('triage-results')).toBeInTheDocument();
      expect(screen.getByTestId('persona-dossier')).toBeInTheDocument();
      expect(screen.getByText('Cyberpunk 2077')).toBeInTheDocument();
    });
  });
});
