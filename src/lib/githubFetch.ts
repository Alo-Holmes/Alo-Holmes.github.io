import { monitoredRepositories, type MonitoredRepo } from '../config/telemetry';

export interface RepoStatus extends MonitoredRepo {
  status: 'passing' | 'failing' | 'unknown';
  updatedAt: string;
  runUrl: string;
}

export async function getPipelinesTelemetry(): Promise<RepoStatus[]> {
  // Ensure this runs only server-side during Astro build/prerender.
  if (typeof window !== 'undefined') {
    return Promise.resolve(
      monitoredRepositories.map((item) => ({ ...item, status: 'unknown', updatedAt: 'Offline', runUrl: '#' }))
    );
  }

  const token = process.env.GITHUB_TOKEN; 
  
  const promises = monitoredRepositories.map(async (item) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${item.owner}/${item.repo}/actions/runs?per_page=1`,
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

      if (response.status === 403) {
        console.warn(`[Telemetry Rate Limit] ${item.repo}: 403 Forbidden - check GITHUB_TOKEN or rate limits`);
        return { ...item, status: 'unknown', updatedAt: 'Offline', runUrl: '#' };
      }

      if (!response.ok) throw new Error(`Status ${response.status}`);
      const data = await response.json();
      const latestRun = data.workflow_runs?.[0];

      if (!latestRun) {
        return { ...item, status: 'unknown', updatedAt: 'No Runs', runUrl: '#' };
      }

      let cleanStatus: 'passing' | 'failing' | 'unknown' = 'unknown';
      if (latestRun.status === 'completed') {
        cleanStatus = latestRun.conclusion === 'success' ? 'passing' : 'failing';
      }

      return {
        ...item,
        status: cleanStatus,
        updatedAt: new Date(latestRun.updated_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        runUrl: latestRun.html_url
      };

    } catch (error) {
      console.warn(`[Telemetry Fallback] ${item.repo}:`, error);
      return { ...item, status: 'unknown', updatedAt: 'Offline', runUrl: '#' };
    }
  });

  return Promise.all(promises);
}
