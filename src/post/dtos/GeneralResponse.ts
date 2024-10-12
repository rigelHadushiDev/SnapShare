import { HttpStatus } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";



export class GeneralResponse {

    @ApiProperty({
        description: 'Descriptive message of the API response',
        example: 'Operation successful.',
    })
    message: string;

    @ApiProperty({
        description: 'HTTP status code of the API response',
        enum: HttpStatus,
        example: HttpStatus.OK,
    })
    status: number;

}