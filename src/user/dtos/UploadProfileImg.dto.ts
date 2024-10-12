import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ProfileImgReq {
    @ApiProperty({
        description: 'Profile image file',
        type: 'string',
        format: 'binary',
    })
    @IsNotEmpty()
    file: Express.Multer.File;
}


export class ProfileImgRes {
    @ApiProperty({
        description: 'URL of the uploaded profile image',
        example: 'http://example.com/uploads/profile.jpg',
    })
    profileImg: string;

    @ApiProperty({
        description: 'Profile description',
        example: 'User profile description',
    })
    profileDescription: string;

    @ApiProperty({
        description: 'First name',
        example: 'John',
    })
    firstName: string;

    @ApiProperty({
        description: 'Last name',
        example: 'Doe',
    })
    lastName: string;

    @ApiProperty({
        description: 'Date and time when the profile image was updated',
        example: '2024-07-06T15:47:00.581Z',
    })
    updatedAt: Date;
}



