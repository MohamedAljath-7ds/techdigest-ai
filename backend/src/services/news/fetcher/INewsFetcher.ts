import { Source } from "@prisma/client";
import { RawArticle } from "../../../types";

export interface INewsFetcher {
  fetch(source: Source): Promise<RawArticle[]>;
}