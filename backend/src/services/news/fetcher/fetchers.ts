import Parser from 'rss-parser';
import { RawArticle } from '../../../types';
import { withRetry } from '../../../utils/helpers';

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'TechDigestAI/1.0 (+https://github.com/techdigest-ai)' },
});

export async function fetchRssFeed(
  feedUrl: string,
  sourceName: string,
  sourceSlug: string,
  limit = 15
): Promise<RawArticle[]> {
  return withRetry(async () => {
    const feed = await parser.parseURL(feedUrl);
    return (feed.items ?? []).slice(0, limit).map((item) => ({
      title: item.title?.trim() ?? 'Untitled',
      url: item.link ?? item.guid ?? '',
      description: item.contentSnippet ?? item.summary ?? undefined,
      contentSnippet: item.content?.slice(0, 2000) ?? item.contentSnippet ?? undefined,
      publishedAt: item.pubDate ? new Date(item.pubDate) : item.isoDate ? new Date(item.isoDate) : undefined,
      sourceName,
      sourceSlug,
    })).filter((a) => a.url);
  });
}

export async function fetchHackerNews(limit = 15): Promise<RawArticle[]> {
  return withRetry(async () => {
    const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const ids = (await topRes.json()) as number[];
    const articles: RawArticle[] = [];

    for (const id of ids.slice(0, limit)) {
      const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
      const item = (await itemRes.json()) as {
        title?: string;
        url?: string;
        text?: string;
        time?: number;
      };
      if (!item?.title) continue;

      const url = item.url ?? `https://news.ycombinator.com/item?id=${id}`;
      articles.push({
        title: item.title,
        url,
        description: item.text?.replace(/<[^>]+>/g, ' ').slice(0, 500),
        publishedAt: item.time ? new Date(item.time * 1000) : undefined,
        sourceName: 'Hacker News',
        sourceSlug: 'hacker-news',
      });
    }
    return articles;
  });
}

export async function fetchGitHubTrending(limit = 10): Promise<RawArticle[]> {
  return withRetry(async () => {
    const res = await fetch('https://github.com/trending?since=daily', {
      headers: { 'User-Agent': 'TechDigestAI/1.0' },
    });
    const html = await res.text();
    const articles: RawArticle[] = [];

    const repoPattern = /<h2 class="h3 lh-condensed">[\s\S]*?<a href="(\/[^"]+)"[\s\S]*?>([^<]+)<\/a>/g;
    let match: RegExpExecArray | null;
    while ((match = repoPattern.exec(html)) !== null && articles.length < limit) {
      const [, path, name] = match;
      const repoName = name.trim();
      articles.push({
        title: `Trending: ${repoName}`,
        url: `https://github.com${path}`,
        description: `GitHub trending repository: ${repoName}`,
        publishedAt: new Date(),
        sourceName: 'GitHub Trending',
        sourceSlug: 'github-trending',
      });
    }
    return articles;
  });
}
