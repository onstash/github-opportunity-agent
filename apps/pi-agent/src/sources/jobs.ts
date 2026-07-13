import type { RawJobHit } from "../normalize/jobs.js";

export async function fetchRawJobHits(): Promise<RawJobHit[]> {
  const rawJobHits: RawJobHit[] = [
    {
      orgName: "Example DevTools",
      postingUrl: "https://github.com/example/jobs/issues/12",
      roleTitle: "Developer Relations Engineer",
      summary: "Looking for a TypeScript-heavy developer educator.",
      skills: ["typescript", "github", "developer tools"],
      updatedAt: "2026-07-09T08:00:00Z",
      source: "official_org",
    },
  ];
  return rawJobHits;
}