import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {ArticlesService} from "../../../shared/services/articles.service";
import {ArticleType} from "../../../../types/article.type";
import {CommentType} from "../../../../types/comment.type";
import {LoaderService} from "../../../shared/services/loader.service";
import {AuthService} from "../../../core/auth/auth.service";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {CommentsService} from "../../../shared/services/comments.service";
import {finalize} from "rxjs";

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {
  article!: ArticleType;
  relatedArticles: ArticleType[] = [];
  comments: CommentType[] = [];
  noComments: boolean = false;
  noMoreComments: boolean = false;
  totalCountComments: number | null = null;
  isLogged: boolean = true;
  textComment: string = '';
  countLike: string = '';


  constructor(private activatedRoute: ActivatedRoute,
              private _snackBar: MatSnackBar,
              private articlesService: ArticlesService,
              private commentsService: CommentsService,
              private authService: AuthService,
              private router: Router,
              private loader: LoaderService) {
  }

  ngOnInit() {

    this.isLogged = this.authService.getIsLoggedIn();

    this.activatedRoute.params.subscribe({
      next: ((params) => {
        this.articlesService.getArticle(params['url'])
          .subscribe({
            next: ((data: ArticleType) => {
              this.article = data;

              const params = {offset: 0, article: this.article.id};
              this.getFirstComments(params);

            }),
            error: ((errorResponse: HttpErrorResponse) => {
              if (errorResponse.error && errorResponse.error.message) {
                this._snackBar.open(errorResponse.error.message);
              } else {
                this._snackBar.open('Ошибка получения данных статьи!');
              }
            })
          });

        this.articlesService.getRelatedArticle(params['url'])
          .subscribe({
            next: ((relatedArticles: ArticleType[]) => {
              this.relatedArticles = relatedArticles;
            }),
            error: ((errorResponse: HttpErrorResponse) => {
              if (errorResponse.error && errorResponse.error.message) {
                this._snackBar.open(errorResponse.error.message);
              } else {
                this._snackBar.open('Ошибка получения данных связанных статей!');
              }
            })
          })
      }),
      error: ((errorResponse: HttpErrorResponse) => {
        if (errorResponse.error && errorResponse.error.message) {
          this._snackBar.open(errorResponse.error.message);
        } else {
          this._snackBar.open('Ошибка получения данных url-адреса!');
        }
      })
    })
  }

  getFirstComments(params: { offset: number, article: string }) {
    this.loader.show();
    this.comments = [];
    this.totalCountComments = 0;
    this.noComments = false;
    this.noMoreComments = false;

    this.commentsService.getCommentsForArticle(params)
      .pipe(finalize(() => this.loader.hide()))
      .subscribe((data) => {
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
      });
  }

  getMoreComments() {
    this.loader.show();
    const params = { offset: this.comments.length, article: this.article.id };

    this.commentsService.getCommentsForArticle(params)
      .pipe(finalize(() => this.loader.hide()))
      .subscribe({
        next: (data) => {
          if (data.comments && data.comments.length > 0) {
            this.comments = [...this.comments, ...data.comments];

            if (this.totalCountComments !== null) {
              this.noMoreComments = this.comments.length >= this.totalCountComments;
            }
          } else {
            this.noMoreComments = true;
          }
        },
        error: (errorResponse: HttpErrorResponse) => {
          this._snackBar.open(errorResponse.error?.message || 'Ошибка загрузки комментариев!');
        }
      });
  }
  sendComment(value: string | null | undefined) {
    if (value) {
      const params = {
        text: value,
        article: this.article.id
      }
      this.articlesService.addComment(params)
        .subscribe({
          next: ((data: DefaultResponseType) => {
            if (!data.error && data.message) {
              this._snackBar.open(data.message);
              this.textComment = '';
              this.router.navigate(['/articles/' + this.article.url]);

              const params = {offset: 0, article: this.article.id};
              this.getFirstComments(params);

            } else {
              this._snackBar.open(data.message);
            }


          }),
          error: ((errorResponse: HttpErrorResponse) => {
            if (errorResponse.error && errorResponse.error.message) {
              this._snackBar.open(errorResponse.error.message);
            } else {
              this._snackBar.open('Ошибка выполнения запроса!');
            }
          })
        })
    } else {
      this._snackBar.open('Необходимо ввести текст комментария!');
    }
  }

}
