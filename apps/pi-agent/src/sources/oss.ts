import type { RawOssHit } from "../normalize/oss.js";

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

export async function fetchRawOssHits(userInput?: string): Promise<RawOssHit[]> {
  const rawOssHits: RawOssHit[] = [
    {
      repoName: "tanstack/query",
      repoUrl: "https://github.com/TanStack/query",
      repoOwner: "TanStack",
      issueTitle: "Improve docs for query invalidation",
      issueBody: "Looking for help improving beginner-facing docs.",
      labels: ["documentation", "good first issue"],
      stars: 18000,
      updatedAt: "2026-07-10T10:00:00Z",
      topics: ["typescript", "react", "data-fetching"],
    },
  ];

  return rawOssHits.filter((hit) =>
    matchesQuery(
      [
        hit.repoName,
        hit.repoOwner,
        hit.issueTitle ?? "",
        hit.issueBody ?? "",
        ...hit.topics,
        ...hit.labels,
      ],
      userInput,
    ),
  );
}
