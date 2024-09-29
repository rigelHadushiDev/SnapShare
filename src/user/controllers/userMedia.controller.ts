import {
    BadRequestException,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Post,
    Query,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileStorage, configureStorageOptions, imgFilters } from '../fileStorage.config';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { ProfileImgReq, ProfileImgRes } from '../dtos/UploadProfileImg.dto';
import { PaginationDto } from '../dtos/GetUserPosts.dto';
import { UserMediaService } from '../services/userMedia.service';
import { GetFeedResp } from 'src/feed/dtos/getFeed.dto';

@ApiBearerAuth()
@ApiTags("User Media APIs")
@Controller('userMedia')
export class UserMediaController {
    constructor(private readonly userMediaService: UserMediaService) {
        configureStorageOptions('profileImg', imgFilters);
    }

    @Post('upload')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('media', fileStorage))
    @ApiOperation({ summary: 'Upload a profile picture', description: 'Uploads a profile picture for the current user.' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: ProfileImgReq, description: 'Profile image upload data', required: true })
    @ApiResponse({ status: HttpStatus.OK, description: 'The profile picture has been uploaded successfully.', type: ProfileImgRes })
    @ApiException(() => BadRequestException, { description: 'User has not uploaded the profile Image [key: "pleaseUploadImg" ]' })
    async postProfilePic(@UploadedFile() file: Express.Multer.File) {
        return await this.userMediaService.postProfilePic(file);
    }

    // this need to get finished after finisheing the comments and likes as a module
    // this will not get only currentUserPost but all user Posts
    // @Get('getUserPosts')
    // @ApiOperation({ summary: 'Get user posts.', description: 'Get the current  logged-in user all its posts that are not archieved or deleted. ' })
    // @ApiQuery({ type: PaginationDto, required: false })
    // async getUserPosts(@Query() query: PaginationDto) {
    //     const { postsByPage, page } = query;
    //     return await this.userMediaService.getUserPosts(postsByPage, page);
    // }

    @Get('getArchivedPosts')
    @ApiOperation({ summary: 'Successfully retrieve the current users archived posts.' })
    @ApiBody({ type: PaginationDto, required: false })
    @ApiResponse({
        status: HttpStatus.OK, description: 'Archived posts of the user are retrieved successfully.', type: GetFeedResp
    })
    @ApiQuery({ name: 'postCommentsLimit', required: false, description: 'Number of the comments that you want to recieve together with the the posts.', type: Number })
    @ApiException(() => NotFoundException, { description: 'No archived posts were found. [key: "noArchivedPosts" ]' })
    async getArchivedPosts(@Query() query: PaginationDto, @Query('postCommentsLimit') postCommentsLimit?: number) {
        const { postsByPage, page } = query;
        return await this.userMediaService.getArchivedPosts(postsByPage, page, postCommentsLimit);
    }


}
