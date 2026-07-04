import { Source } from "@prisma/client";
import { ApiFetcher } from "./aiFetcher";
import { RSSFetcher } from "./rssFetcher";
import { ScraperFetcher } from "./scrapeFetcher";
import { INewsFetcher } from "./INewsFetcher";

export class FetcherFactory {

    private static readonly rss = new RSSFetcher();
    private static readonly api = new ApiFetcher();
    private static readonly scrape = new ScraperFetcher();

    static getFetcher(source: Source): INewsFetcher {
        switch (source.type) {
            case "RSS":
                return this.rss;
            case "API":
                return this.api;
            case "SCRAPE":
                return this.scrape;
            default:
                throw new Error(`Unsupported source type: ${source.type}`);
        }
    }
}