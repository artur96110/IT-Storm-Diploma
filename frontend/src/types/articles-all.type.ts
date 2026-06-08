import {ArticleType} from "./article.type";

export type ArticlesAllType = {
  count: number,
  pages: number,
  items: ArticleType[],
}
