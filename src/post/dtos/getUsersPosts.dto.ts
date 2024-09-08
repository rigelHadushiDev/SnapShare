import { ApiProperty } from "@nestjs/swagger";
import { PostWithCommentsDto } from "./getFeed.dto";

export class GetUserPostsRes {
    @ApiProperty({ type: [PostWithCommentsDto] })
    userPostsContainer: PostWithCommentsDto[];
}