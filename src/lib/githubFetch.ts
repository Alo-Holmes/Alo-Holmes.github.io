import { monitoredRepositories, type MonitoredRepo } from '../config/telemetry';

interface GitHubActionsRun {
  id: number;
  status: 'queued' | 'in_progress' | 'completed' | string;
  conclusion: 'success' | 'failure' | 'cancelled' | 'timed_out' | 'action_required' | 'neutral' | null;
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

  if (run.status === 'in_progress' || run.status === 'queued') {
    return 'unknown';
  }

  return 'unknown';
}

function parseRunDate(run: GitHubActionsRun): string {
  const timestamp = run.updated_at ?? run.created_at;
  if (!timestamp) return 'Unknown';

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Unknown';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export async function getPipelinesTelemetry(): Promise<RepoStatus[]> {
  if (typeof window !== 'undefined') {
    return Promise.resolve(
      monitoredRepositories.map((item) => ({ ...item, status: 'unknown', updatedAt: 'Offline', runUrl: '#' }))
    );
  }

  const token = process.env.GITHUB_TOKEN;
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Astro-Portfolio-Telemetry',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const promises = monitoredRepositories.map(async (item) => {
    try {
<<<<<<< Updated upstream
      const response = await fetch(
        `https://api.github.com/repos/${item.owner}/${item.repo}/actions/runs?per_page=1&status=completed&branch=main`,
        {
          headers: token ? { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'Astro-Portfolio-Telemetry'
          } : { 
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'Astro-Portfolio-Telemetry'
          }
        }
      );
=======
      const response = await fetch(buildWorkflowRunsUrl(item), { headers });
>>>>>>> Stashed changes

      if (response.status === 403 || response.status === 404) {
        console.warn(`[Telemetry Fallback] ${item.repo}: ${response.status} ${response.statusText}`);
        return { ...item, status: 'unknown', updatedAt: 'Offline', runUrl: '#' };
      }

      if (!response.ok) throw new Error(`Status ${response.status}`);

      const data = (await response.json()) as GitHubActionsRunsResponse;
      const runs = Array.isArray(data.workflow_runs) ? data.workflow_runs : [];
      const latestRun = runs[0];

      if (!latestRun) {
<<<<<<< Updated upstream
        console.log(`[Telemetry Info] ${item.repo}: No completed runs found on main branch.`);
        return { ...item, status: 'unknown', updatedAt: 'No Runs', runUrl: '#' };
      }

      console.log(`[Telemetry Info] ${item.repo}: Latest Run Found - ID: ${latestRun.id}, Status: ${latestRun.status}, Conclusion: ${latestRun.conclusion}, Updated: ${latestRun.updated_at}`);

      let cleanStatus: 'passing' | 'failing' | 'unknown' = 'unknown';
      if (latestRun.status === 'completed') {
        cleanStatus = latestRun.conclusion === 'success' ? 'passing' : 'failing';
=======
        return { ...item, status: 'unknown', updatedAt: 'Offline', runUrl: '#' };
>>>>>>> Stashed changes
      }

      return {
        ...item,
        status: getRunStatus(latestRun),
        updatedAt: parseRunDate(latestRun),
        runUrl: latestRun.html_url ?? '#'
      };
    } catch (error) {
      console.warn(`[Telemetry Fallback] ${item.repo}:`, error);
      return { ...item, status: 'unknown', updatedAt: 'Offline', runUrl: '#' };
    }
  });

  return Promise.all(promises);
}
