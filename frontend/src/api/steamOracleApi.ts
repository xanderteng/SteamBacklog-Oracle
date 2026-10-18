import {
  SteamGameResponse,
  SyncSummaryResponse,
  TriageRequest,
  TriageResponse,
  ProblemDetail,
} from '../types/steam';

export class ProblemDetailError extends Error {
  public problem: ProblemDetail;

  constructor(problem: ProblemDetail) {
    super(problem.detail || problem.title || `HTTP Error ${problem.status}`);
    this.name = 'ProblemDetailError';
    this.problem = problem;
  }
}

const DEFAULT_BASE_URL = 'http://localhost:8080/api/v1/steam';

export const getApiBaseUrl = (): string => {
  return (
    (typeof import.meta !== 'undefined' &&
      import.meta.env &&
      import.meta.env.VITE_API_BASE_URL) ||
    DEFAULT_BASE_URL
  );
};

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let problem: ProblemDetail;
  try {
    const errorJson = await response.json();
    problem = {
      status: errorJson.status || response.status,
      title: errorJson.title || response.statusText || 'Request Error',
      detail: errorJson.detail || 'An unexpected error occurred during the request.',
      type: errorJson.type,
      instance: errorJson.instance,
      timestamp: errorJson.timestamp,
      errors: errorJson.errors,
    };
  } catch {
    problem = {
      status: response.status,
      title: response.statusText || 'Network Error',
      detail: `Request failed with HTTP status ${response.status}`,
    };
  }

  throw new ProblemDetailError(problem);
}

export const steamOracleApi = {
  async syncLibrary(steamId: string): Promise<SyncSummaryResponse> {
    const trimmedId = steamId.trim();
    const url = `${getApiBaseUrl()}/sync/${encodeURIComponent(trimmedId)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
      },
    });
    return handleResponse<SyncSummaryResponse>(response);
  },

  async getBacklog(steamId: string): Promise<SteamGameResponse[]> {
    const trimmedId = steamId.trim();
    const url = `${getApiBaseUrl()}/backlog/${encodeURIComponent(trimmedId)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    return handleResponse<SteamGameResponse[]>(response);
  },

  async triageBacklog(
    steamId: string,
    request: TriageRequest
  ): Promise<TriageResponse> {
    const trimmedId = steamId.trim();
    const url = `${getApiBaseUrl()}/backlog/${encodeURIComponent(trimmedId)}/triage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(request),
    });
    return handleResponse<TriageResponse>(response);
  },
};
