import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { ArticlesService } from "../../../shared/services/articles.service";
import { ArticleType } from "../../../../types/article.type";
import { CommentType } from "../../../../types/comment.type";
import { LoaderService } from "../../../shared/services/loader.service";
import { AuthService } from "../../../core/auth/auth.service";
import { HttpErrorResponse } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DefaultResponseType } from "../../../../types/default-response.type";
import { CommentsService } from "../../../shared/services/comments.service";
import { finalize } from "rxjs";

type CommentsResponseType = {
  allCount?: number;
  comments?: CommentType[];
};

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {
  article: ArticleType;
  relatedArticles: ArticleType[] = [];
  comments: CommentType[] = [];
  noComments = false;
  noMoreComments = false;
  totalCountComments: number | null = null;
  isLogged = true;
  textComment = '';
  countLike = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private articlesService: ArticlesService,
    private commentsService: CommentsService,
    private authService: AuthService,
    private router: Router,
    private loader: LoaderService
  ) {

    this.article = {
      id: '',
      title: '',
      description: '',
      image: '',
      date: '',
      category: '',
      url: '',
      text: '',
      comments: [],
      commentsCount: 0
    };
  }

  ngOnInit(): void {
    this.isLogged = this.authService.getIsLoggedIn();

    this.activatedRoute.params.subscribe({
      next: (params): void => {
        const articleUrl: string = params['url'];

        this.articlesService.getArticle(articleUrl)
          .subscribe({
            next: (data: ArticleType): void => {
              this.article = data;

              this.getFirstComments({
                offset: 0,
                article: data.id
              });
            },
            error: (errorResponse: HttpErrorResponse): void => {
              this.handleError(errorResponse, 'Ошибка получения данных статьи!');
            }
          });

        this.articlesService.getRelatedArticle(articleUrl)
          .subscribe({
            next: (relatedArticles: ArticleType[]): void => {
              this.relatedArticles = relatedArticles;
            },
            error: (errorResponse: HttpErrorResponse): void => {
              this.handleError(errorResponse, 'Ошибка получения данных связанных статей!');
            }
          });
      },
      error: (errorResponse: HttpErrorResponse): void => {
        this.handleError(errorResponse, 'Ошибка получения данных url-адреса!');
      }
    });
  }

  getFirstComments(params: { offset: number, article: string }): void {
    this.loader.show();

    this.comments = [];
    this.totalCountComments = 0;
    this.noComments = false;
    this.noMoreComments = false;

    this.commentsService.getCommentsForArticle(params)
      .pipe(finalize((): void => this.loader.hide()))
      .subscribe({
        next: (data: CommentsResponseType): void => {
          if (data.allCount) {
            this.totalCountComments = data.allCount;
          }

          if (data.comments && data.comments.length > 0) {
            this.comments = data.comments.slice(0, 3);

            if (this.totalCountComments !== null && this.totalCountComments <= 3) {
              this.noMoreComments = true;
            }
          } else {
            this.noComments = true;
            this.noMoreComments = true;
          }
        },
        error: (errorResponse: HttpErrorResponse): void => {
          this.handleError(errorResponse, 'Ошибка загрузки комментариев!');
        }
      });
  }

  getMoreComments(): void {

    this.loader.show();

    const params = {
      offset: this.comments.length,
      article: this.article.id
    };

    this.commentsService.getCommentsForArticle(params)
      .pipe(finalize((): void => this.loader.hide()))
      .subscribe({
        next: (data: CommentsResponseType): void => {
          if (data.comments && data.comments.length > 0) {
            this.comments = [...this.comments, ...data.comments];

            if (this.totalCountComments !== null) {
              this.noMoreComments = this.comments.length >= this.totalCountComments;
            }
          } else {
            this.noMoreComments = true;
          }
        },
        error: (errorResponse: HttpErrorResponse): void => {
          this.handleError(errorResponse, 'Ошибка загрузки комментариев!');
        }
      });
  }

  sendComment(value: string | null | undefined): void {

    if (!value) {
      this._snackBar.open('Необходимо ввести текст комментария!');
      return;
    }

    const params = {
      text: value,
      article: this.article.id
    };

    this.articlesService.addComment(params)
      .subscribe({
        next: (data: DefaultResponseType): void => {
          if (!data.error && data.message) {
            this._snackBar.open(data.message);
            this.textComment = '';
            this.router.navigate(['/articles/' + this.article.url]);

            this.getFirstComments({
              offset: 0,
              article: params.article
            });
          } else {
            this._snackBar.open(data.message);
          }
        },
        error: (errorResponse: HttpErrorResponse): void => {
          this.handleError(errorResponse, 'Ошибка выполнения запроса!');
        }
      });
  }

  private handleError(errorResponse: HttpErrorResponse, defaultMessage: string): void {
    if (errorResponse.error && errorResponse.error.message) {
      this._snackBar.open(errorResponse.error.message);
    } else {
      this._snackBar.open(defaultMessage);
    }
  }
}
