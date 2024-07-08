import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength, minLength } from "class-validator";


export class EditPostDto {

    // later it can expand in other fields for example tags
    @ApiProperty()
    @IsNotEmpty()
    @MinLength(1)
    @IsString()
    currPostDesc: string;
}