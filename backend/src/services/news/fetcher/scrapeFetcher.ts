import { Source } from "@prisma/client";
import { fetchGitHubTrending } from "./fetchers";
import { RawArticle } from "../../../types";
import { INewsFetcher } from "./INewsFetcher";

export class ScraperFetcher implements INewsFetcher {

  async fetch(source: Source): Promise<RawArticle[]> {

    switch (source.slug) {
      case "github-trending":
        return fetchGitHubTrending();

      default:
        return [];
    }

  }

}