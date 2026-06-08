import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
import {ArticleType} from "../../../types/article.type";
import {ArticlesFiltersType} from "../../../types/articles-filters.type";
import {ArticlesAllType} from "../../../types/articles-all.type";
import {DefaultResponseType} from "../../../types/default-response.type";

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  constructor(private http: HttpClient) { }

  getPopularArticles(): Observable<ArticleType[]> {
    return this.http.get<ArticleType[]>(environment.api + 'articles/top');
  }

  getArticles (params: ArticlesFiltersType): Observable<ArticlesAllType> {
    return this.http.get<ArticlesAllType>(environment.api + 'articles', {
      params: params
    });
  }

  getArticle(url: string): Observable<ArticleType> {
    return this.http.get<ArticleType>(environment.api + 'articles/' + url);
  };

  getRelatedArticle(url: string): Observable<ArticleType[]> {
    return this.http.get<ArticleType[]>(environment.api + 'articles/related/' + url);
  }

  addComment(params: { text: string, article: string}): Observable<DefaultResponseType> {
    return this.http.post<DefaultResponseType>(environment.api + 'comments', params);
  }

}
