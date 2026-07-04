import { TriggerType } from '@prisma/client';
import { prisma, persistLog } from '../../utils/logger';
import { env } from '../../config/env';
import { fetchAllNews, persistArticles } from '../news/newsService';
import { summarizeArticle, detectTrendingTopics } from '../ai/aiService';
import { buildDigestResult, buildDigestStats, splitWhatsAppMessage } from './digestFormatter';
import { whatsAppService } from '../whatsapp/whatsappService';
import { ProcessedArticle } from '../../types';

export async function runDigestPipeline(triggeredBy: TriggerType = 'SCHEDULED'): Promise<string> {
  await persistLog('INFO', 'Starting digest pipeline', { triggeredBy });

  const rawArticles = await fetchAllNews(false);
  await persistLog('INFO', `Fetched ${rawArticles.length} articles`);

  await persistArticles(rawArticles);

  const processed: ProcessedArticle[] = [];
  for (const raw of rawArticles) {

  const summary = await summarizeArticle(raw);
  if (!summary) continue;

  const article = await prisma.article.findUnique({
    where: { url: raw.url }
  });

  if (!article) continue;

  await prisma.summary.upsert({
    where: {
      articleId: article.id
    },
    create: {
      articleId: article.id,
      summary: summary.summary,
      category: summary.category,
      importanceScore: summary.importanceScore,
      whyItMatters: summary.whyItMatters,
      keyTakeaway: summary.keyTakeaway,
      isClickbait: false,
      verified: true,
      verificationNote: "Skipped (Testing Mode)"
    },
    update: {
      summary: summary.summary,
      category: summary.category,
      importanceScore: summary.importanceScore,
      whyItMatters: summary.whyItMatters,
      keyTakeaway: summary.keyTakeaway,
      verified: true,
      verificationNote: "Skipped (Testing Mode)"
    }
  });

  processed.push({
    id: article.id,
    title: raw.title,
    url: raw.url,
    sourceName: raw.sourceName,
    publishedAt: raw.publishedAt ?? null,
    summary: summary.summary,
    category: summary.category,
    importanceScore: summary.importanceScore,
    whyItMatters: summary.whyItMatters,
    keyTakeaway: summary.keyTakeaway,
    verified: true
  });

}

  processed.sort((a, b) => b.importanceScore - a.importanceScore);
  const selected = processed.slice(0, env.MAX_ARTICLES_PER_DIGEST);

  const trendingTopics = await detectTrendingTopics(
    selected.map((a) => ({ category: a.category, title: a.title, summary: a.summary }))
  );

  const stats = buildDigestStats(rawArticles.length, selected);
  const digestResult = buildDigestResult(selected, trendingTopics, stats);

  const digest = await prisma.digest.create({
    data: {
      title: `Daily Tech Digest - ${new Date().toISOString().slice(0, 10)}`,
      message: digestResult.message,
      topFiveMessage: digestResult.topFiveMessage,
      trendingTopics: digestResult.trendingTopics,
      stats: digestResult.stats as object,
      triggeredBy,
      items: {
        create: selected.map((a, rank) => ({
          articleId: a.id,
          rank: rank + 1,
        })),
      },
    },
  });

  try {

  console.log("whole env: " + env)

  const phone = env.WHATSAPP_RECIPIENT;

  console.log("number" + phone);

  if (!phone) {
    throw new Error("WHATSAPP_RECIPIENT is not configured.");
  }

  await whatsAppService.initialize();

  const chunks = splitWhatsAppMessage(digestResult.message);

  for (const chunk of chunks) {
    await whatsAppService.sendMessage(phone, chunk);
  }

  if (digestResult.topFiveMessage) {
    await whatsAppService.sendMessage(
      phone,
      digestResult.topFiveMessage
    );
  }

  await prisma.digest.update({
    where: { id: digest.id },
    data: {
      sendStatus: 'SENT',
      sentAt: new Date(),
    },
  });

  await persistLog('INFO', 'Digest sent successfully', {
    digestId: digest.id,
  });

} catch (error) {

  const message =
    error instanceof Error
      ? error.message
      : 'Send failed';

  await prisma.digest.update({
    where: { id: digest.id },
    data: {
      sendStatus: 'FAILED',
      sendError: message,
    },
  });

  await persistLog('ERROR', 'Failed to send digest', {
    digestId: digest.id,
    error: message,
  });

  throw error;
}

  return digest.id;
}

export async function getDigestById(id: string) {
  return prisma.digest.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          article: { include: { summary: true } },
        },
        orderBy: { rank: 'asc' },
      },
    },
  });
}

export async function searchDigests(query: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const where = query
    ? {
        OR: [
          { title: { contains: query, mode: 'insensitive' as const } },
          { message: { contains: query, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [digests, total] = await Promise.all([
    prisma.digest.findMany({
      where,
      orderBy: { date: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        date: true,
        sendStatus: true,
        sentAt: true,
        triggeredBy: true,
        trendingTopics: true,
        stats: true,
      },
    }),
    prisma.digest.count({ where }),
  ]);

  return { digests, total, page, limit };
}

export async function searchArticles(query: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const where = query
    ? {
        OR: [
          { title: { contains: query, mode: 'insensitive' as const } },
          { description: { contains: query, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { summary: true, source: true },
      orderBy: { fetchedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return { articles, total, page, limit };
}
