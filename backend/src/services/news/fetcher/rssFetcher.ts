import Parser from "rss-parser";
import { INewsFetcher } from "./INewsFetcher";
import { Source } from "@prisma/client";
import { RawArticle } from "../../../types";

const parser = new Parser();

export class RSSFetcher implements INewsFetcher {

  async fetch(source: Source): Promise<RawArticle[]> {

    const feed = await parser.parseURL(source.url);

    return (feed.items ?? []).map(item => ({
      title: item.title ?? "",
      url: item.link ?? "",
      description: item.contentSnippet,
      contentSnippet: item.content,
      publishedAt: item.isoDate ? new Date(item.isoDate) : undefined,
      sourceName: source.name,
      sourceSlug: source.slug,
    }));
  }

}