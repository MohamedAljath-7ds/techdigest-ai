import { Source } from '@prisma/client';
import { prisma, persistLog } from '../../utils/logger';
import { getCached, setCache } from '../../utils/cache';
import { isDuplicate, contentHash } from '../../utils/helpers';
import { env } from '../../config/env';
import { RawArticle } from '../../types';
import { FetcherFactory } from './fetcher/fetchFactory';

const CACHE_KEY = 'news:all-articles';

async function fetchFromSource(source: Source): Promise<RawArticle[]> {

    const fetcher = FetcherFactory.getFetcher(source);

    return fetcher.fetch(source);

}

export async function fetchAllNews(useCache = true): Promise<RawArticle[]> {
  if (useCache) {
    const cached = await getCached<RawArticle[]>(CACHE_KEY);
    if (cached) return cached;
  }

  const sources = await prisma.source.findMany({ where: { enabled: true } });
  const allArticles: RawArticle[] = [];
  const seen: { title: string; url: string }[] = [];

  for (const source of sources) {
    try {
      const articles = await fetchFromSource(source);
      let added = 0;

      for (const article of articles) {
        if (isDuplicate(article, seen)) continue;
        seen.push({ title: article.title, url: article.url });
        allArticles.push(article);
        added++;
      }

      await prisma.source.update({
        where: { id: source.id },
        data: {
          lastFetched: new Date(),
          fetchCount: { increment: 1 },
          lastError: null,
        },
      });

      await persistLog('INFO', `Fetched ${added} articles from ${source.name}`, { source: source.slug });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown fetch error';
      await prisma.source.update({
        where: { id: source.id },
        data: { errorCount: { increment: 1 }, lastError: message },
      });
      await persistLog('ERROR', `Failed to fetch from ${source.name}`, { error: message });
    }
  }

  await setCache(CACHE_KEY, allArticles, env.CACHE_TTL_MINUTES);
  return allArticles;
}

export async function persistArticles(rawArticles: RawArticle[]): Promise<string[]> {
  const articleIds: string[] = [];

  for (const raw of rawArticles) {
    const source = await prisma.source.findUnique({ where: { slug: raw.sourceSlug } });
    if (!source) continue;

    const hash = contentHash(raw.title, raw.url);
    const article = await prisma.article.upsert({
      where: { url: raw.url },
      create: {
        title: raw.title,
        url: raw.url,
        sourceName: raw.sourceName,
        sourceId: source.id,
        description: raw.description,
        contentSnippet: raw.contentSnippet,
        publishedAt: raw.publishedAt,
        contentHash: hash,
      },
      update: {
        title: raw.title,
        description: raw.description,
        contentSnippet: raw.contentSnippet,
        publishedAt: raw.publishedAt,
        contentHash: hash,
      },
    });
    articleIds.push(article.id);
  }

  return articleIds;
}

export async function initializeSources(): Promise<void> {
  const { NEWS_SOURCES } = await import('../../config/env');
  for (const src of NEWS_SOURCES) {
    await prisma.source.upsert({
      where: { slug: src.slug },
      create: {
        name: src.name,
        slug: src.slug,
        type: src.type,
        url: src.url,
        enabled: true,
      },
      update: { name: src.name, url: src.url, type: src.type },
    });
  }
}
