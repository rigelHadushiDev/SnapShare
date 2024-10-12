import { ApiProperty } from "@nestjs/swagger";
import { PostWithCommentsDto } from "../../feed/dtos/getFeed.dto";

export class GetPostIdRes {
    @ApiProperty({ type: [PostWithCommentsDto] })
    postIdContainer: PostWithCommentsDto[];
}