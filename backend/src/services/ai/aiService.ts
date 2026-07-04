import { AISummaryResult, VerificationResult } from "../../types";

export async function summarizeArticle(article: {
  title: string;
  url: string;
  description?: string | null;
  contentSnippet?: string | null;
  sourceName: string;
}): Promise<AISummaryResult> {

  const summary =
    article.description?.trim() ||
    article.contentSnippet?.trim() ||
    article.title;

  return {
    summary,
    category: detectCategory(summary),
    importanceScore: 10,
    whyItMatters: `Source: ${article.sourceName}`,
    keyTakeaway: article.title,
    isClickbait: false,
    shouldSkip: false
  };
}

export async function verifySummary(): Promise<VerificationResult> {
  return {
    verified: true,
    note: "Verification skipped in testing mode."
  };
}

export async function detectTrendingTopics(
  articles: {
    category: string;
    title: string;
    summary: string;
  }[]
): Promise<string[]> {

  const map: Record<string, number> = {};

  for (const article of articles) {
    map[article.category] = (map[article.category] || 0) + 1;
  }

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key)
    .slice(0, 5);
}

function detectCategory(text: string): string {

  const value = text.toLowerCase();

  if (
    value.includes("ai") ||
    value.includes("gpt") ||
    value.includes("gemini") ||
    value.includes("llm")
  ) {
    return "AI";
  }

  if (
    value.includes("java") ||
    value.includes("javascript") ||
    value.includes("typescript") ||
    value.includes("python") ||
    value.includes("react") ||
    value.includes("angular") ||
    value.includes("vue")
  ) {
    return "Programming";
  }

  if (
    value.includes("aws") ||
    value.includes("azure") ||
    value.includes("gcp") ||
    value.includes("cloud")
  ) {
    return "Cloud";
  }

  if (
    value.includes("security") ||
    value.includes("hack") ||
    value.includes("malware") ||
    value.includes("vulnerability")
  ) {
    return "Security";
  }

  if (
    value.includes("android") ||
    value.includes("ios") ||
    value.includes("iphone")
  ) {
    return "Mobile";
  }

  if (
    value.includes("docker") ||
    value.includes("kubernetes") ||
    value.includes("devops")
  ) {
    return "DevOps";
  }

  if (
    value.includes("chip") ||
    value.includes("gpu") ||
    value.includes("cpu") ||
    value.includes("hardware")
  ) {
    return "Hardware";
  }

  if (
    value.includes("startup") ||
    value.includes("funding")
  ) {
    return "Startup";
  }

  return "Other";
}