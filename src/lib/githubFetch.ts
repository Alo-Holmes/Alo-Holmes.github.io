import { monitoredRepositories, type MonitoredRepo } from '../config/telemetry';

interface GitHubActionsRun {
  id: number;
  status: 'queued' | 'in_progress' | 'completed' | string;
  conclusion:
    | 'success'
    | 'failure'
    | 'cancelled'
    | 'timed_out'
    | 'action_required'
    | 'neutral'
    | null;
  html_url: string;
  updated_at?: string | null;
  created_at?: string | null;
  head_branch?: string;
  head_sha?: string;

}

interface GitHubActionsRunsResponse {
  workflow_runs?: GitHubActionsRun[];
}

export interface RepoStatus extends MonitoredRepo {
  status: 'passing' | 'failing' | 'unknown';
  updatedAt: string;
  runUrl: string;
}

function buildWorkflowRunsUrl(item: MonitoredRepo): string {
  const url = new URL(`https://api.github.com/repos/${item.owner}/${item.repo}/actions/runs`);
  url.searchParams.set('per_page', '10');

  const branch = item.branch ?? process.env.TELEMETRY_BRANCH;
  if (branch) {
    url.searchParams.set('branch', branch);
  }

  return url.toString();
}

function getRunStatus(run: GitHubActionsRun): RepoStatus['status'] {
  if (run.status === 'completed') {
    return run.conclusion === 'success' ? 'passing' : 'failing';
  }
  

  return 'unknown';
}

function parseRunDate(run: GitHubActionsRun): string {
  const timestamp = run.updated_at ?? run.created_at;
  if (!timestamp) {
    return 'Unknown';
  }


  if (run.status === 'in_progress' || run.status === 'queued') {
    return 'unknown';
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

const fallbackStatus: RepoStatus['status'] = 'unknown';

export async function getPipelinesTelemetry(): Promise<RepoStatus[]> {
  if (typeof window !== 'undefined') {
    return Promise.resolve(
      
      monitoredRepositories.map((item) => ({
        ...item,
        status: 'unknown',
        updatedAt: 'Offline',
        runUrl: '#'
      }))
    );
  }

  const token = process.env.GITHUB_TOKEN;

  const promises: Promise<RepoStatus>[] = monitoredRepositories.map(
    async (item): Promise<RepoStatus> => {
      try {
        const response = await fetch(buildWorkflowRunsUrl(item), {
          headers: {
            Accept: 'application/vnd.github+json',
            'User-Agent': 'Astro-Portfolio-Telemetry',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        if (response.status === 403 || response.status === 404) {
          console.warn(`[Telemetry Fallback] ${item.repo}: ${response.status} ${response.statusText}`);
          return {
            ...item,
            status: fallbackStatus,
            updatedAt: 'Offline',
            runUrl: '#'
          };
        }

        if (!response.ok) {
          throw new Error(`Status ${response.status}`);
        }

        const data = (await response.json()) as GitHubActionsRunsResponse;
        const latestRun = Array.isArray(data.workflow_runs) ? data.workflow_runs[0] : undefined;

        if (!latestRun) {
          return {
            ...item,
            status: fallbackStatus,
            updatedAt: 'No Runs',
            runUrl: '#'
          };
        }

        return {
          ...item,
          status: getRunStatus(latestRun),
          updatedAt: parseRunDate(latestRun),
          runUrl: latestRun.html_url ?? '#'
        };
      } catch (error) {
        console.warn(`[Telemetry Fallback] ${item.repo}:`, error);
        return {
          ...item,
          status: fallbackStatus,
          updatedAt: 'Offline',
          runUrl: '#'
        };
      }
    }
  );

  return Promise.all(promises);
}

