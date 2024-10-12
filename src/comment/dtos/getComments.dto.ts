import { ApiPropertyOptional } from "@nestjs/swagger";
import { CommentDto } from "src/feed/dtos/getFeed.dto";

export class GetCommentRes {
    @ApiPropertyOptional({ type: CommentDto })
    comment: CommentDto;
} 
