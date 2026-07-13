const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "in",
  "looking",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

function tokenize(userInput: string): string[] {
  return userInput
    .toLowerCase()
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)
    .filter((term) => !STOP_WORDS.has(term));
}

export function matchesQuery(fields: string[], userInput?: string): boolean {
  if (!userInput?.trim()) {
    return true;
  }

  const haystack = fields.join(" ").toLowerCase();
  const terms = tokenize(userInput);

  if (terms.length === 0) {
    return true;
  }

  const matchedTerms = terms.filter((term) => haystack.includes(term));
  return matchedTerms.length >= Math.min(2, terms.length);
}
