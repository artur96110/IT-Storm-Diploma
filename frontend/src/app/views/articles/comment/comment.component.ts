import {Component, Input, OnInit} from '@angular/core';
import {CommentType} from "../../../../types/comment.type";
import {CommentReactionType} from "../../../../types/comment-reaction.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";
import {MatSnackBar} from "@angular/material/snack-bar";
import {CommentsService} from "../../../shared/services/comments.service";
import {CommentReactionResponseType} from "../../../../types/comment-reaction-response.type";
import {AuthService} from "../../../core/auth/auth.service";

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {
  @Input() comment!: CommentType;
  @Input() articleId!: string;
  likeChecked: boolean = false;
  dislikeChecked: boolean = false;
  violateSend: boolean = false;
  private isLogged: boolean = false;

  constructor(private _snackBar: MatSnackBar,
              private authService: AuthService,
              private commentsService: CommentsService) {
  }

  ngOnInit(): void {
    this.isLogged = this.authService.getIsLoggedIn();

    if (this.isLogged) {
      this.loadUserReactions();
    }
  }

  private loadUserReactions(): void {
    this.commentsService.getUserReactions(this.articleId)
      .subscribe({
        next: (data: CommentReactionResponseType[]) => {
          const userReaction = data.find(item => item.comment === this.comment.id);
          if (userReaction) {
            this.updateReactionState(userReaction.action);
          }
        },
        error: (errorResponse: HttpErrorResponse) => {
          this.handleError(errorResponse);
        }
      });
  }

  private updateReactionState(action: CommentReactionType): void {
    this.likeChecked = action === CommentReactionType.like;
    this.dislikeChecked = action === CommentReactionType.dislike;
  }

  like(id: string): void {
    if (!this.isLogged) {
      this._snackBar.open('Для выполнения действия необходимо авторизоваться!');
      return;
    }

    if (this.likeChecked) {
      return;
    }

    this.applyReaction(id, CommentReactionType.like);
  }

  dislike(id: string): void {
    if (!this.isLogged) {
      this._snackBar.open('Для выполнения действия необходимо авторизоваться!');
      return;
    }

    if (this.dislikeChecked) {
      return;
    }

    this.applyReaction(id, CommentReactionType.dislike);
  }

  private applyReaction(commentId: string, action: CommentReactionType | null): void {
    this.commentsService.applyReactionToComment(commentId, action)
      .subscribe({
        next: (data: DefaultResponseType) => {
          if (!data.error) {
            this.updateLocalReactionState(action);
            this._snackBar.open('Ваш голос учтен!');
          } else {
            this._snackBar.open(data.message || 'Произошла ошибка!');
          }
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.error) {
            const errorMessage = typeof errorResponse.error === 'object'
              ? errorResponse.error.message
              : errorResponse.error;
            this._snackBar.open(errorMessage || 'Неизвестная ошибка сервера!');
          } else {
            this._snackBar.open('Ошибка соединения с сервером!');
          }
        }
      });
  }

  private updateLocalReactionState(action: CommentReactionType | null): void {
    if (this.likeChecked) {
      this.likeChecked = false;
      this.comment.likesCount--;
    }
    if (this.dislikeChecked) {
      this.dislikeChecked = false;
      this.comment.dislikesCount--;
    }

    if (action === CommentReactionType.like) {
      this.likeChecked = true;
      this.comment.likesCount++;
    } else if (action === CommentReactionType.dislike) {
      this.dislikeChecked = true;
      this.comment.dislikesCount++;
    }
  }

  sendViolate(id: string): void {
    if (!this.isLogged) {
      this._snackBar.open('Для выполнения действия необходимо авторизоваться');
      return;
    }

    if (this.violateSend) {
      this._snackBar.open('Жалоба уже отправлена!');
      return;
    }

    this.commentsService.applyReactionToComment(id, CommentReactionType.violate)
      .subscribe({
        next: (data: DefaultResponseType) => {
          this.violateSend = true;
          const message = data.error ? data.message : 'Жалоба отправлена';
          this._snackBar.open(message);
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.status === 400) {
            this.violateSend = true;
            this._snackBar.open('Жалоба уже отправлена!');
          } else {
            this.handleError(errorResponse);
          }
        }
      });
  }

  private handleError(errorResponse: HttpErrorResponse): void {
    if (errorResponse.error && errorResponse.error.message) {
      this._snackBar.open(errorResponse.error.message);
    } else {
      this._snackBar.open('Ошибка выполнения запроса!');
    }
  }
}
