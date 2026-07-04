import { env } from '../../config/env';
import { ProcessedArticle, DigestResult, DigestStats } from '../../types';
import { formatDateIST, formatDateTimeIST } from '../../utils/helpers';

export function formatWhatsAppDigest(
  articles: ProcessedArticle[],
  trendingTopics: string[],
  stats: DigestStats,
  date = new Date()
): string {
  const lines: string[] = [
    '🚀 *Daily Tech Digest*',
    `📅 Date: ${formatDateIST(date)}`,
    '',
    '🔥 *Top Stories*',
    '',
  ];

  articles.forEach((article, index) => {
    lines.push(`${index + 1}. *${escapeWhatsApp(article.title)}*`);
    lines.push(`📰 _Source:_ ${article.sourceName} | ${article.publishedAt ? formatDateTimeIST(article.publishedAt) : 'Recent'}`);
    lines.push(`🏷️ _Category:_ ${article.category} | ⭐ ${article.importanceScore}/10`);
    lines.push('');
    lines.push('📰 *Summary:*');
    lines.push(escapeWhatsApp(article.summary));
    lines.push('');
    lines.push('💡 *Why it matters:*');
    lines.push(escapeWhatsApp(article.whyItMatters));
    lines.push('');
    lines.push('🎯 *Key takeaway:*');
    lines.push(escapeWhatsApp(article.keyTakeaway));
    lines.push('');
    lines.push(`🔗 *Source:* ${article.url}`);
    lines.push('');
    lines.push('------------------');
    lines.push('');
  });

  if (trendingTopics.length > 0) {
    lines.push('📈 *Trending Technologies*');
    trendingTopics.forEach((t) => lines.push(`• ${t}`));
    lines.push('');
  }

  lines.push('⚡ *Quick Stats*');
  lines.push(`- Articles analyzed: ${stats.articlesAnalyzed}`);
  lines.push(`- Selected: ${stats.selected}`);
  Object.entries(stats.categories).forEach(([cat, count]) => {
    lines.push(`- ${cat}: ${count}`);
  });
  lines.push('');
  lines.push('_AI-generated summaries. Facts sourced from original articles._');

  return lines.join('\n');
}

export function formatTopFiveDigest(articles: ProcessedArticle[], date = new Date()): string {
  const top5 = articles.slice(0, 5);
  const lines: string[] = [
    '⚡ *Top 5 in 60 Seconds*',
    `📅 ${formatDateIST(date)}`,
    '',
  ];

  top5.forEach((article, i) => {
    lines.push(`${i + 1}. *${escapeWhatsApp(article.title)}*`);
    lines.push(`   ${escapeWhatsApp(article.keyTakeaway)}`);
    lines.push(`   🔗 ${article.url}`);
    lines.push('');
  });

  return lines.join('\n');
}

export function buildDigestStats(
  articlesAnalyzed: number,
  selected: ProcessedArticle[]
): DigestStats {
  const categories: Record<string, number> = {};
  for (const a of selected) {
    categories[a.category] = (categories[a.category] ?? 0) + 1;
  }
  return { articlesAnalyzed, selected: selected.length, categories };
}

export function buildDigestResult(
  articles: ProcessedArticle[],
  trendingTopics: string[],
  stats: DigestStats,
  date = new Date()
): DigestResult {
  return {
    message: formatWhatsAppDigest(articles, trendingTopics, stats, date),
    topFiveMessage: formatTopFiveDigest(articles, date),
    trendingTopics,
    stats,
    articles,
  };
}

function escapeWhatsApp(text: string): string {
  return text.replace(/\*/g, '\\*').replace(/_/g, '\\_').replace(/~/g, '\\~');
}

export function splitWhatsAppMessage(message: string, maxLength = 4000): string[] {
  if (message.length <= maxLength) return [message];

  const chunks: string[] = [];
  const sections = message.split('\n------------------\n');
  let current = '';

  for (const section of sections) {
    const candidate = current ? `${current}\n------------------\n${section}` : section;
    if (candidate.length > maxLength) {
      if (current) chunks.push(current.trim());
      if (section.length > maxLength) {
        for (let i = 0; i < section.length; i += maxLength) {
          chunks.push(section.slice(i, i + maxLength));
        }
        current = '';
      } else {
        current = section;
      }
    } else {
      current = candidate;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}
