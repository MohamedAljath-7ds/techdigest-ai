import { Source } from "@prisma/client";
import { fetchHackerNews } from "./fetchers";
import { RawArticle } from "../../../types";
import { INewsFetcher } from "./INewsFetcher";

export class ApiFetcher implements INewsFetcher {

  async fetch(source: Source): Promise<RawArticle[]> {

    switch (source.slug) {
      case "hacker-news":
        return fetchHackerNews();

      default:
        return [];
    }

  }

}