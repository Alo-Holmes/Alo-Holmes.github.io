# CLI Mission Brief: Portfolio Redesign (Phase 1)

## Role & Context
You are an expert front-end engineering agent executing a UI/UX layout transformation. The user is a senior-leaning Software/Hardware Engineer specializing in QA Automation and DevOps. The underlying portfolio content is functional and proven in recruitment pipelines, but the visual aesthetic requires an immediate upgrade to a premium, modern Bento Grid design.

## Objective
Migrate the raw content from `legacy-source.md` into a structured, highly aesthetic Astro + Tailwind CSS portfolio. Treat design fluidity and layout polish as equal in priority to technical execution.

## Core Rules & Execution Constraints
1. **Scope Gating:** This is Phase 1 (Visual Transformation Only). Do NOT add new copy, invent features, or create dynamic API/repository integration widgets. 
2. **Data Parity:** You must pull all text, company timelines, skills matrices, and testimonials directly from `legacy-source.md` with zero omissions.
3. **Link Parity:** Ensure the existing repository links and section fragments (`#key-projects` and `#demos`) are preserved as simple, working anchor routes targeting his external GitHub profiles for now.
4. **Technology Stack:**
   - Framework: Astro (Static output mode)
   - Styling: Tailwind CSS
   - Typing: TypeScript (Strict mode)

## Targeted Directory Architecture
You will build out and populate the following folder layout:
- `src/layouts/Layout.astro` -> Global HTML head, viewport metadata, Tailwind configuration imports.
- `src/components/BentoGrid.astro` -> The core responsive CSS Grid wrapper.
- `src/components/BentoCard.astro` -> Reusable card component handling hover states, borders, and shadows.
- `src/pages/index.astro` -> The main assembly page pulling data into the grid blocks.

## Verification Checklist (Definition of Done)
- `npm run dev` starts the server without errors.
- The UI perfectly scales across Mobile, Tablet, and Desktop break-points.
- `npm run build` successfully compiles to 100% static HTML assets in the `dist/` directory with zero TypeScript compiler flags tripped.

## Next Action
Read `legacy-source.md` and generate the layout scaffold configuration inside `src/layouts/Layout.astro` and `tailwind.config.mjs`. Stop and verify with the user once the configuration files are created.

## PHASE 2: SYSTEM TELEMETRY MONITOR (BENTO UPGRADE)

### 1. Objective
Replace the static "Phase 2" placeholder card at the bottom of the main layout with an automated, configuration-driven CI/CD System Telemetry Panel. This panel will display the live build/test status of public target repositories fetched at build-time.

### 2. Architectural Guardrails & Contract
* **No Runtime Javascript Cost:** All API fetching must happen exclusively at build-time within Astro server-side frontmatter execution blocks.
* **Production Circuit Breaker:** Wrap API calls in robust `try/catch` logic. If the GitHub API fails or returns an unexpected schema, catch the error, log a console warning, and return a graceful fallback status of `'unknown'` with an `'Offline'` timestamp. The build *must never* hard-crash.
* **Environment Agnostic:** Ensure the logic gracefully executes during local development (`npm run dev`) when `process.env.GITHUB_TOKEN` is missing, without stalling the local server.

### Phase 3. File Execution Blueprint

#### Step 3.1: Create Configuration File
Create `src/config/telemetry.ts`:
```typescript
export interface MonitoredRepo {
  id: string;
  owner: string;
  repo: string;
  label: string;
  framework: 'playwright' | 'cypress' | 'postman';
}

export const monitoredRepositories: MonitoredRepo[] = [
  {
    id: "playwright-e2e",
    owner: "Alo-Holmes",
    repo: "playwright-automation", // CLI: Verify user's actual repo target if needed
    label: "End-to-End Test Suite",
    framework: "playwright"
  },
  {
    id: "cypress-regression",
    owner: "Alo-Holmes",
    repo: "cypress-tests",
    label: "Regression Automation",
    framework: "cypress"
  },
  {
    id: "postman-api",
    owner: "Alo-Holmes",
    repo: "api-testing-postman",
    label: "Integration API Suite",
    framework: "postman"
  }
];
Step 3.2: Create the Build-Time Fetch Engine
Create src/lib/githubFetch.ts:

TypeScript
import { monitoredRepositories, type MonitoredRepo } from '../config/telemetry';

export interface RepoStatus extends MonitoredRepo {
  status: 'passing' | 'failing' | 'unknown';
  updatedAt: string;
  runUrl: string;
}

export async function getPipelinesTelemetry(): Promise<RepoStatus[]> {
  const token = process.env.GITHUB_TOKEN; 
  
  const promises = monitoredRepositories.map(async (item) => {
    try {
      const response = await fetch(
        `https://api.github.com/repos/${item.owner}/${item.repo}/actions/runs?per_page=1`,
        {
          headers: token ? { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github+json' 
          } : { 'Accept': 'application/vnd.github+json' }
        }
      );

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
Step 3.3: Create Visual Component
Create src/components/TelemetryCard.astro styled cleanly with your existing Tailwind setup. It must map through the data returned by getPipelinesTelemetry(), display framework acronym identifiers (PW, CY, PM), render glowing utility indicator lights matching the status (bg-emerald-500 for passing, bg-rose-500 for failing, bg-neutral-600 for unknown), and provide direct anchor click-through paths to runUrl.

Step 3.4: Integrate Component into Main Page
Open src/pages/index.astro:

Import TelemetryCard in the layout frontmatter.

Locate the legacy layout container containing the static "Phase 2..." planning text string.

Completely replace that specific placeholder block with the new <TelemetryCard /> instance, ensuring the wrapping grid utility classes maintain layout alignment integrity.

Phase 4. Verification Step
Run npm run build locally to verify that the project still compiles perfectly into the static directory with zero linting or typescript type-errors.


