import { IsNotEmpty, IsString, MinLength, minLength } from "class-validator";


export class EditPostDto {

    // later it can expand in other fields for example tags
    @IsNotEmpty()
    @MinLength(1)
    @IsString()
    currPostDesc: string;
}