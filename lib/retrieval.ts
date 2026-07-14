// Lightweight keyword-overlap scorer. No embeddings needed at this corpus size —
// this just prevents us from stuffing every process into every request.

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "to", "of", "and",
  "or", "in", "on", "for", "with", "how", "do", "i", "we", "you", "what", "when",
  "where", "why", "it", "this", "that", "can", "please", "help", "me", "my",
  "our", "does", "did", "should", "would", "could", "there", "here", "so",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

export function rankByRelevance<T extends { title: string; category: string | null; content: string }>(
  query: string,
  items: T[]
): T[] {
  const queryWords = new Set(tokenize(query));
  if (queryWords.size === 0) return items;

  const scored = items.map((item) => {
    const haystack = tokenize(`${item.title} ${item.category || ""} ${item.content}`);
    let score = 0;
    for (const word of haystack) {
      if (queryWords.has(word)) score += 1;
    }
    const titleWords = tokenize(`${item.title} ${item.category || ""}`);
    for (const word of titleWords) {
      if (queryWords.has(word)) score += 3;
    }
    return { item, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.item);
}

export function selectWithinBudget<T extends { content: string }>(
  rankedItems: T[],
  maxChars: number,
  maxItems: number
): T[] {
  const selected: T[] = [];
  let total = 0;
  for (const item of rankedItems) {
    if (selected.length >= maxItems) break;
    const size = item.content.length;
    if (total + size > maxChars && selected.length > 0) break;
    selected.push(item);
    total += size;
  }
  if (selected.length === 0 && rankedItems.length > 0) {
    selected.push(rankedItems[0]);
  }
  return selected;
}