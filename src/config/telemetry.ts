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
    repo: "Playwright-Demo-2025",
    label: "End-to-End Test Suite",
    framework: "playwright"
  },
  {
    id: "cypress-regression",
    owner: "Alo-Holmes",
    repo: "cypress-portfolio-demo",
    label: "Regression Automation",
    framework: "cypress"
  },
  {
    id: "postman-api",
    owner: "Alo-Holmes",
    repo: "my_postman_collections",
    label: "Integration API Suite",
    framework: "postman"
  }
];
