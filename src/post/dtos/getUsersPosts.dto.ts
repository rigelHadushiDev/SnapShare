import { ApiProperty } from "@nestjs/swagger";
import { PostWithCommentsDto } from "../../feed/dtos/getFeed.dto";

export class GetUserPostsRes {
    @ApiProperty({ type: [PostWithCommentsDto] })
    userPostsContainer: PostWithCommentsDto[];
}