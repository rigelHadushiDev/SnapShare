import {
    Body,
    ConflictException,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    UploadedFile,
    UseFilters,
    UseInterceptors,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/CreateUserDto';
import { UpdateUserDto } from './dtos/UpdateUserDto';
import { UsersService } from './users.service';
import { Public } from 'src/common/decorators/public.decorator';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { FileInterceptor } from '@nestjs/platform-express';
import { profileStorage } from './fileStorage.config';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';


@UseFilters(HttpExceptionFilter)
@ApiBearerAuth()
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Public()
    @Post()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Sign up a user', description: 'Create a new user account.' })
    @ApiException(() => ConflictException, { description: 'User with this email already exists [key: "emailTaken" ]' })
    @ApiException(() => ConflictException, { description: 'User with this username already exists [key: "usernameTaken" ]' })
    @ApiBody({ type: CreateUserDto })
    // continue with documenting
    // @ApiResponse({ status: 200, description: 'The anomaly record has been successfully updated or inserted.', type: Anomaly })
    async createUser(@Body() createUserDto: CreateUserDto) {
        const { email, username, password } = createUserDto;
        const newUser = await this.userService.createUser(
            email,
            username,
            password,
        );
        return { message: 'UserCreatedSuccessfully', user: newUser };
    }

    @Post('upload')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(FileInterceptor('file', profileStorage))
    postProfilePic(@UploadedFile() file) {
        return this.userService.postProfilePic(file);
    }

    @Get('profileImg')
    getUserProfile() {
        return this.userService.getProfilePic();
    }

    @Get(':userName')
    async getUserByUsername(@Param('userName') username: string) {
        throw Error("hello");
        return await this.userService.getUserByUsername(username);
    }

    @Put('update')
    async updateUser(@Body() updateUserDto: UpdateUserDto) {
        return await this.userService.updateUser(updateUserDto);
    }

    @Put("archieve")
    async archiveUser() {
        return await this.userService.archiveUser();
    }

    @Delete('/hardRemove')
    async hardDeleteUser() {
        return await this.userService.hardDeleteUser();
    }



}

