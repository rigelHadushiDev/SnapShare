import { ApiProperty } from "@nestjs/swagger";

export class GetCountDto {

    @ApiProperty({ example: 32, description: "The count of the unseen notificcations" })
    counter: number;

}