import {CommentReactionType} from "./comment-reaction.type";

export type CommentReactionResponseType = {
    comment: string,
    action: CommentReactionType,
}
