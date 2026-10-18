import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CommandHeader } from '../CommandHeader';
import { SyncSummaryResponse } from '../../../types/steam';

describe('CommandHeader Component', () => {
  const mockSyncSummary: SyncSummaryResponse = {
    steamId: '76561198000000000',
    totalImported: 42,
    totalUpdated: 15,
    backlogCount: 27,
  };

  it('renders branding title and operational status LED banner', () => {
    render(
      <CommandHeader
        steamId="76561198000000000"
        onSteamIdChange={vi.fn()}
        onSync={vi.fn()}
        isSyncing={false}
        syncSummary={null}
      />
    );

    expect(screen.getByText(/SteamBacklog/i)).toBeInTheDocument();
    expect(screen.getByText(/SYSTEM OPERATIONAL/i)).toBeInTheDocument();
  });

  it('renders telemetry stat cards with values when syncSummary is provided', () => {
    render(
      <CommandHeader
        steamId="76561198000000000"
        onSteamIdChange={vi.fn()}
        onSync={vi.fn()}
        isSyncing={false}
        syncSummary={mockSyncSummary}
      />
    );

    expect(screen.getByTestId('stat-total-imported')).toHaveTextContent('42');
    expect(screen.getByTestId('stat-updated')).toHaveTextContent('15');
    expect(screen.getByTestId('stat-backlog-queue')).toHaveTextContent('27');
  });

  it('calls onSteamIdChange when typing into input', () => {
    const onSteamIdChange = vi.fn();
    render(
      <CommandHeader
        steamId=""
        onSteamIdChange={onSteamIdChange}
        onSync={vi.fn()}
        isSyncing={false}
        syncSummary={null}
      />
    );

    const input = screen.getByLabelText(/Steam ID 64/i);
    fireEvent.change(input, { target: { value: '76561198000000001' } });
    expect(onSteamIdChange).toHaveBeenCalledWith('76561198000000001');
  });

  it('triggers onSync callback when form is submitted', () => {
    const onSync = vi.fn();
    render(
      <CommandHeader
        steamId="76561198000000000"
        onSteamIdChange={vi.fn()}
        onSync={onSync}
        isSyncing={false}
        syncSummary={null}
      />
    );

    const button = screen.getByRole('button', { name: /INITIALIZE SYNC/i });
    fireEvent.click(button);
    expect(onSync).toHaveBeenCalledTimes(1);
  });

  it('disables button and displays SYNCHRONIZING when isSyncing is true', () => {
    render(
      <CommandHeader
        steamId="76561198000000000"
        onSteamIdChange={vi.fn()}
        onSync={vi.fn()}
        isSyncing={true}
        syncSummary={null}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText(/SYNCHRONIZING.../i)).toBeInTheDocument();
  });
});
