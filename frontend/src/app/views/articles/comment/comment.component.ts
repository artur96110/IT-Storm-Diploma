import { Component, Input, OnInit } from '@angular/core';
import { CommentType } from "../../../../types/comment.type";
import { CommentReactionType } from "../../../../types/comment-reaction.type";
import { DefaultResponseType } from "../../../../types/default-response.type";
import { HttpErrorResponse } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CommentsService } from "../../../shared/services/comments.service";
import { CommentReactionResponseType } from "../../../../types/comment-reaction-response.type";
import { AuthService } from "../../../core/auth/auth.service";

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {
  @Input() comment!: CommentType;
  @Input() articleId!: string;

  likeChecked = false;
  dislikeChecked = false;
  violateSend = false;

  private isLogged = false;

  constructor(
    private _snackBar: MatSnackBar,
    private authService: AuthService,
    private commentsService: CommentsService
  ) {
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
        next: (data: CommentReactionResponseType[]): void => {
          const userReaction = data.find((item: CommentReactionResponseType) => item.comment === this.comment.id);

          if (userReaction) {
            this.updateReactionState(userReaction.action);
          }
        },
        error: (errorResponse: HttpErrorResponse): void => {
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

    this.applyReaction(id, CommentReactionType.like);
  }

  dislike(id: string): void {
    if (!this.isLogged) {
      this._snackBar.open('Для выполнения действия необходимо авторизоваться!');
      return;
    }

    this.applyReaction(id, CommentReactionType.dislike);
  }

  private applyReaction(commentId: string, action: CommentReactionType): void {
    this.commentsService.applyReactionToComment(commentId, action)
      .subscribe({
        next: (data: DefaultResponseType): void => {
          if (!data.error) {
            this.updateLocalReactionState(action);
            this._snackBar.open('Ваш голос учтен!');
          } else {
            this._snackBar.open(data.message || 'Произошла ошибка!');
          }
        },
        error: (errorResponse: HttpErrorResponse): void => {
          this.handleError(errorResponse);
        }
      });
  }

  private updateLocalReactionState(action: CommentReactionType): void {
    if (action === CommentReactionType.like && this.likeChecked) {
      this.likeChecked = false;
      this.comment.likesCount--;
      return;
    }

    if (action === CommentReactionType.dislike && this.dislikeChecked) {
      this.dislikeChecked = false;
      this.comment.dislikesCount--;
      return;
    }

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
    }

    if (action === CommentReactionType.dislike) {
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
        next: (data: DefaultResponseType): void => {
          this.violateSend = true;
          const message = data.error ? data.message : 'Жалоба отправлена';
          this._snackBar.open(message);
        },
        error: (errorResponse: HttpErrorResponse): void => {
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
