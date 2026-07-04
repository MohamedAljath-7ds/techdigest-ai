export interface RawArticle {
  title: string;
  url: string;
  description?: string;
  contentSnippet?: string;
  publishedAt?: Date;
  sourceName: string;
  sourceSlug: string;
}

export interface ProcessedArticle {
  id: string;
  title: string;
  url: string;
  sourceName: string;
  publishedAt: Date | null;
  summary: string;
  category: string;
  importanceScore: number;
  whyItMatters: string;
  keyTakeaway: string;
  verified: boolean;
}

export interface DigestStats {
  articlesAnalyzed: number;
  selected: number;
  categories: Record<string, number>;
}

export interface DigestResult {
  message: string;
  topFiveMessage: string;
  trendingTopics: string[];
  stats: DigestStats;
  articles: ProcessedArticle[];
}

export interface AISummaryResult {
  summary: string;
  category: string;
  importanceScore: number;
  whyItMatters: string;
  keyTakeaway: string;
  isClickbait: boolean;
  shouldSkip: boolean;
}

export interface VerificationResult {
  verified: boolean;
  note?: string;
}
