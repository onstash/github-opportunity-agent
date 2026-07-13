import type { RawJobHit } from "../normalize/jobs.js";

function matchesQuery(fields: string[], userInput?: string): boolean {
  if (!userInput?.trim()) {
    return true;
  }

  const haystack = fields.join(" ").toLowerCase();
  const terms = userInput
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  return terms.every((term) => haystack.includes(term));
}

export async function fetchRawJobHits(userInput?: string): Promise<RawJobHit[]> {
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

  return rawJobHits.filter((hit) =>
    matchesQuery(
      [hit.orgName, hit.roleTitle, hit.summary, ...hit.skills],
      userInput,
    ),
  );
}
