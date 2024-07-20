import { ApiProperty } from "@nestjs/swagger";



export class ConnectionsCntRes {

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

}