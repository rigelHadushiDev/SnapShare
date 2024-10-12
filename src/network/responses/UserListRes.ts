import { ApiProperty } from "@nestjs/swagger";

export class UserListRes {

    @ApiProperty({ example: 7, description: 'Unique identifier of the user' })
    userId: number;

    @ApiProperty({ example: 'username1', description: 'Username of the user' })
    username: string;

    @ApiProperty({ description: 'Profile image URL of the user' })
    profileImg: string;

    @ApiProperty({ example: false, description: 'Indicates if the user is followed by the current user' })
    isFollowedbyCurrUser: boolean;

    @ApiProperty({ example: false, description: 'Indicates if the user is the current loged in user' })
    isCurrentUser: boolean;
}