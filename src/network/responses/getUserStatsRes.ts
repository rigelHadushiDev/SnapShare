import { ApiProperty } from "@nestjs/swagger";



export class GetUserStatsRes {

    @ApiProperty({
        description: 'Number of SnapShare accounts users is following',
        example: 3,
    })
    followingCount: number;

    @ApiProperty({
        description: 'Number of SnapShare accounts user is beeing followed by',
        example: 2
    })
    followersCount: number;


    @ApiProperty({
        description: 'Number of posts the user has in its account.',
        example: 5
    })
    postsCount: number;
}