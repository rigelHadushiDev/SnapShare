import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    NotFoundException,
    Param,
    Post,
    Put,
    UploadedFile,
    UseFilters,
    UseInterceptors,
    ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/CreateUserDto';
import { UpdateUserDto } from './dtos/UpdateUserDto';
import { UsersService } from './users.service';
import { Public } from 'src/common/decorators/public.decorator';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';
import { FileInterceptor } from '@nestjs/platform-express';
import { profileStorage } from './fileStorage.config';

@UseFilters(HttpExceptionFilter)
@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Public()
    @Post()
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
        return await this.userService.getUserByUsername(username);
    }

    @Put('update')
    async updateUser(@Body() updateUserDto: UpdateUserDto) {
        return await this.userService.updateUser(updateUserDto);
    }

    @Put()
    async archiveUser() {
        return await this.userService.archiveUser();
    }

    @Delete('/hard')
    async hardDeleteUser() {
        return await this.userService.hardDeleteUser();
    }



}
