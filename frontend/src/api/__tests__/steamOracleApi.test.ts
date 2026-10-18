import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { steamOracleApi, ProblemDetailError } from '../steamOracleApi';
import { SyncSummaryResponse, SteamGameResponse, TriageResponse, TriageRequest } from '../../types/steam';

describe('steamOracleApi', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('syncLibrary', () => {
    it('successfully initiates sync and returns SyncSummaryResponse', async () => {
      const mockSummary: SyncSummaryResponse = {
        steamId: '76561198000000000',
        totalImported: 10,
        totalUpdated: 2,
        backlogCount: 8,
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockSummary,
      } as unknown as Response);

      const result = await steamOracleApi.syncLibrary('76561198000000000');
      expect(result).toEqual(mockSummary);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/steam/sync/76561198000000000',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('throws ProblemDetailError on 400 Invalid Steam ID error', async () => {
      const mockProblem = {
        title: 'Invalid Steam ID',
        status: 400,
        detail: 'Steam ID must be numeric',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => mockProblem,
      } as unknown as Response);

      await expect(steamOracleApi.syncLibrary('invalid_id')).rejects.toThrow(ProblemDetailError);
      try {
        await steamOracleApi.syncLibrary('invalid_id');
      } catch (err) {
        const error = err as ProblemDetailError;
        expect(error.problem.status).toBe(400);
        expect(error.problem.title).toBe('Invalid Steam ID');
        expect(error.problem.detail).toBe('Steam ID must be numeric');
      }
    });
  });

  describe('getBacklog', () => {
    it('successfully retrieves backlog games list', async () => {
      const mockGames: SteamGameResponse[] = [
        {
          id: 1,
          steamId: '76561198000000000',
          appId: 1091500,
          name: 'Cyberpunk 2077',
          playtimeForeverMinutes: 45,
          imgIconUrl: 'cyberpunk.jpg',
          isBacklog: true,
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockGames,
      } as unknown as Response);

      const result = await steamOracleApi.getBacklog('76561198000000000');
      expect(result).toEqual(mockGames);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/steam/backlog/76561198000000000',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('handles non-JSON error response gracefully with fallback ProblemDetail', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Not JSON');
        },
      } as unknown as Response);

      try {
        await steamOracleApi.getBacklog('76561198000000000');
        expect.fail('Should have thrown ProblemDetailError');
      } catch (err) {
        const error = err as ProblemDetailError;
        expect(error.problem.status).toBe(500);
        expect(error.problem.title).toBe('Internal Server Error');
      }
    });
  });

  describe('triageBacklog', () => {
    it('successfully posts triage request and returns TriageResponse', async () => {
      const request: TriageRequest = {
        mood: 'Fast-paced action',
        availableMinutes: 45,
        maxRecommendations: 2,
      };

      const mockTriageResponse: TriageResponse = {
        steamId: '76561198000000000',
        playerPersonaSummary: 'High energy action seeker.',
        recommendations: [
          {
            appId: 1145360,
            name: 'Hades',
            playtimeForeverMinutes: 30,
            imgIconUrl: 'hades.jpg',
            matchScore: 95,
            whyPlayNow: 'Fast runs fit your 45-min window.',
            estimatedSessionMinutes: 40,
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockTriageResponse,
      } as unknown as Response);

      const result = await steamOracleApi.triageBacklog('76561198000000000', request);
      expect(result).toEqual(mockTriageResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/v1/steam/backlog/76561198000000000/triage',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(request),
        })
      );
    });

    it('throws ProblemDetailError on 404 Empty Backlog', async () => {
      const mockProblem = {
        title: 'Empty Backlog',
        status: 404,
        detail: 'No backlog games found for Steam ID: 76561198000000000',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => mockProblem,
      } as unknown as Response);

      await expect(
        steamOracleApi.triageBacklog('76561198000000000', { mood: 'chill', availableMinutes: 30 })
      ).rejects.toThrow(ProblemDetailError);
    });
  });
});
