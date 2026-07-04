import { formatWhatsAppDigest, buildDigestStats, splitWhatsAppMessage } from './digestFormatter';
import { ProcessedArticle } from '../../types';

const mockArticles: ProcessedArticle[] = [
  {
    id: '1',
    title: 'OpenAI launches new API',
    url: 'https://openai.com/blog/new-api',
    sourceName: 'OpenAI Blog',
    publishedAt: new Date('2026-07-01T10:00:00Z'),
    summary: 'OpenAI announced a new API endpoint for developers.',
    category: 'AI',
    importanceScore: 9,
    whyItMatters: 'Developers can integrate new capabilities.',
    keyTakeaway: 'New API endpoint is available.',
    verified: true,
  },
];

describe('digestFormatter', () => {
  it('formats WhatsApp digest with required sections', () => {
    const stats = buildDigestStats(10, mockArticles);
    const message = formatWhatsAppDigest(mockArticles, ['MCP', 'AI Agents'], stats);

    expect(message).toContain('Daily Tech Digest');
    expect(message).toContain('Top Stories');
    expect(message).toContain('OpenAI launches new API');
    expect(message).toContain('https://openai.com/blog/new-api');
    expect(message).toContain('Trending Technologies');
    expect(message).toContain('Quick Stats');
    expect(message).toContain('AI-generated summaries');
  });

  it('builds category stats', () => {
    const stats = buildDigestStats(20, mockArticles);
    expect(stats.articlesAnalyzed).toBe(20);
    expect(stats.selected).toBe(1);
    expect(stats.categories.AI).toBe(1);
  });

  it('splits long messages', () => {
    const long = 'A'.repeat(5000);
    const chunks = splitWhatsAppMessage(long, 4000);
    expect(chunks.length).toBeGreaterThan(1);
    chunks.forEach((c: string) => expect(c.length).toBeLessThanOrEqual(4000));
  });
});
