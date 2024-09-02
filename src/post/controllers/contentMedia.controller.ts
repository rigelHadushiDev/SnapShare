import { Body, Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
const path = require('path');
const fs = require('fs');
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ContentMediaService } from '../services/contentMedia.service';


@ApiBearerAuth()
@ApiTags("Content Media APIs")
@Controller('contentMedia')
export class ContentMediaController {

    constructor(private readonly ContentMediaService: ContentMediaService) { }

    @Get('display/:type/:userName/:filename/:mediaId?')
    @ApiOperation({ summary: 'Retrieve a media file by type, username, and filename' })
    @ApiParam({ name: 'type', description: 'The type of media (e.g., image, video)' })
    @ApiParam({ name: 'userName', description: 'The hashed username of the media owner' })
    @ApiParam({ name: 'filename', description: 'The filename of the media' })
    @ApiParam({ name: 'mediaId', description: 'The Id of the media', required: false, type: Number })
    @ApiResponse({
        status: HttpStatus.OK, description: 'The media file has been successfully retrieved.', content: { 'application/octet-stream': {} }
    })
    getMedia(@Param('userName') userName: string, @Param('type') type: string, @Param('filename') filename: string, @Param('mediaId') mediaId: number, @Res() res: Response,) {
        return this.ContentMediaService.getMedia(userName, type, filename, mediaId, res);
    }
}