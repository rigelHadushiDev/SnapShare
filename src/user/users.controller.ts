import {
    BadRequestException,
    Body,
    ConflictException,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
    UploadedFile,
    UseFilters,
    UseInterceptors,
} from '@nestjs/common';
import { CreateUserReq, UserResDto, UserInfoDto } from './dtos/CreateUser.dto';
import { UpdateUserDto } from './dtos/UpdateUserDto';
import { UsersService } from './users.service';
import { Public } from 'src/common/decorators/public.decorator';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileStorage, configureStorageOptions, imgFilters } from './fileStorage.config';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { ProfileImgReq, ProfileImgRes } from './dtos/UploadProfileImg.dto';
import { GetUserPostsReq } from './dtos/GetUserPosts.dto';

@ApiBearerAuth()
@ApiTags("User Module")
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {
        configureStorageOptions('profileImg', imgFilters);
    }

    @Public()
    @Post()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Sign up a user', description: 'Create a new user account.' })
    @ApiException(() => ConflictException, { description: 'User with this email already exists [key: "emailTaken" ]' })
    @ApiException(() => ConflictException, { description: 'User with this username already exists [key: "usernameTaken" ]' })
    @ApiBody({ type: CreateUserReq, required: true })
    @ApiResponse({ status: HttpStatus.OK, description: 'The user has been successfully created.', type: UserResDto })
    async createUser(@Body() createUserDto: CreateUserReq) {
        return await this.userService.createUser(createUserDto);
    }

    @Post('upload')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file', fileStorage))
    @ApiOperation({ summary: 'Upload a profile picture', description: 'Uploads a profile picture for the current user.' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: ProfileImgReq, description: 'Profile image upload data', required: true })
    @ApiResponse({ status: HttpStatus.OK, description: 'The profile picture has been uploaded successfully.', type: ProfileImgRes })
    @ApiException(() => BadRequestException, { description: 'User has not uploaded the profile Image [key: "pleaseUploadImg" ]' })
    async postProfilePic(@UploadedFile() file: Express.Multer.File) {
        return this.userService.postProfilePic(file);
    }

    @Get('userData')
    @ApiOperation({ summary: 'Retrieve user data.', description: 'Retrieve current loged in user data.' })
    @ApiResponse({ status: HttpStatus.OK, description: 'The profile picture has been uploaded successfully.', type: UserResDto })
    @ApiException(() => NotFoundException, { description: 'The loged in user has not been found. [key: "userNotFound" ]' })
    async getUserData() {
        return await this.userService.getUserData();
    }

    @Put('update')
    @ApiOperation({ summary: 'Update user.', description: 'Update current logged-in user.' })
    @ApiBody({ type: UpdateUserDto, description: 'Updated user data', required: true })
    @ApiResponse({ status: HttpStatus.OK, description: 'The current loged-in user has been successfully updated.', type: UserResDto })
    @ApiException(() => ConflictException, { description: 'Email is already taken by another user. [key: "emailIsTaken" ]' })
    @ApiException(() => ConflictException, { description: 'Username is already taken by another user. [key: "usernameIsTaken" ]' })
    async updateUser(@Body() updateUserDto: UpdateUserDto) {
        return await this.userService.updateUser(updateUserDto);
    }


    @Put("archieve")
    @ApiOperation({ summary: 'Archieve user.', description: 'Archieve current logged-in user.' })
    @ApiResponse({ status: HttpStatus.OK, description: 'The current loged-in user has been successfully archieved.', type: UserResDto })
    @ApiException(() => NotFoundException, { description: 'The loged in user has not been found. [key: "userNotFound" ]' })
    async archiveUser() {
        return await this.userService.archiveUser();
    }

    @Delete('hardRemove')
    @ApiOperation({ summary: 'Delete user.', description: 'Delete current logged-in user.' })
    @ApiResponse({ status: HttpStatus.OK, description: 'The current loged-in user has been successfully deleted.', type: UserResDto })
    @ApiException(() => InternalServerErrorException, { description: 'An error happened deleting the user. [key: "errorDeletingPost" ]' })
    @ApiException(() => NotFoundException, { description: 'The loged in user has not been found. [key: "userNotFound" ]' })
    async hardDeleteUser() {
        return await this.userService.hardDeleteUser();
    }

    @Get('getUserPosts')
    @ApiOperation({ summary: 'Get user posts.', description: 'Get the current  logged-in user all its posts that are not archieved or deleted. ' })
    @ApiQuery({ type: GetUserPostsReq, required: false })
    async getUserPosts(@Query() query: GetUserPostsReq) {
        const { postsByPage, page } = query;
        return await this.userService.getUserPosts(postsByPage, page);
    }

}

