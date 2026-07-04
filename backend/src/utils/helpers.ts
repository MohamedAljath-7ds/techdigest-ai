import crypto from 'crypto';

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function contentHash(title: string, url: string): string {
  return crypto.createHash('sha256').update(`${normalizeTitle(title)}|${url}`).digest('hex').slice(0, 16);
}

export function urlHash(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.search = '';
    parsed.hash = '';
    return crypto.createHash('sha256').update(parsed.toString()).digest('hex').slice(0, 16);
  } catch {
    return crypto.createHash('sha256').update(url).digest('hex').slice(0, 16);
  }
}

export function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(normalizeTitle(a).split(' ').filter(Boolean));
  const wordsB = new Set(normalizeTitle(b).split(' ').filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  const union = new Set([...wordsA, ...wordsB]).size;
  return intersection / union;
}

export function isDuplicate(
  candidate: { title: string; url: string },
  existing: { title: string; url: string }[]
): boolean {
  const candidateUrlHash = urlHash(candidate.url);
  for (const item of existing) {
    if (urlHash(item.url) === candidateUrlHash) return true;
    if (titleSimilarity(candidate.title, item.title) >= 0.75) return true;
  }
  return false;
}

export function formatDateIST(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

export function formatDateTimeIST(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, delayMs * attempt));
      }
    }
  }
  throw lastError;
}
