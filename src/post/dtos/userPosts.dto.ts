import { ApiProperty } from "@nestjs/swagger";

export class UserPostsDto {
    @ApiProperty()
    postId: number;

    @ApiProperty()
    userId: number;

    @ApiProperty()
    likesNr: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty()
    archive: boolean;

    @ApiProperty()
    postDescription: string;

    @ApiProperty()
    commentsNr: number;

    @ApiProperty()
    mediaContent: any;
}
