import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AmbientCanvas } from '../AmbientCanvas';
import { ErrorBanner } from '../ErrorBanner';
import { ProblemDetail } from '../../../types/steam';

describe('Common Components', () => {

  describe('AmbientCanvas', () => {
    it('renders ambient canvas container', () => {
      render(<AmbientCanvas />);
      expect(screen.getByTestId('ambient-canvas')).toBeInTheDocument();
    });
  });

  describe('ErrorBanner', () => {
    it('returns null when problem is null', () => {
      const { container } = render(<ErrorBanner problem={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders problem detail title, status, and message', () => {
      const problem: ProblemDetail = {
        title: 'Empty Backlog',
        status: 404,
        detail: 'No backlog games found for Steam ID: 12345',
      };

      render(<ErrorBanner problem={problem} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('HTTP 404')).toBeInTheDocument();
      expect(screen.getByText('Empty Backlog')).toBeInTheDocument();
      expect(screen.getByText(/No backlog games found/i)).toBeInTheDocument();
    });

    it('calls onDismiss callback when close button is clicked', () => {
      const problem: ProblemDetail = {
        title: 'Validation Error',
        status: 400,
        detail: 'Mood cannot be blank',
      };
      const onDismiss = vi.fn();

      render(<ErrorBanner problem={problem} onDismiss={onDismiss} />);
      const closeBtn = screen.getByLabelText(/Dismiss error/i);
      fireEvent.click(closeBtn);
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });
});
