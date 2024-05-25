import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
    UseFilters,
    ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/CreateUserDto';
import { UpdateUserDto } from './dtos/UpdateUserDto';
import { UsersService } from './users.service';
import { Public } from 'src/common/decorators/public.decorator';
import { HttpExceptionFilter } from 'src/common/filters/http-exception.filter';

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

    @Get(':id')
    async getUserById(@Param('id') id: string) {
        return await this.userService.getUserById(id);
    }

    @Get(':userName')
    async getUserByUsername(@Param('userName') username: string) {
        return await this.userService.getUserByUsername(username);
    }

    @Put('update/:id')
    async updateUser(@Param('id',) id: string, @Body(new ValidationPipe()) updateUserDto: UpdateUserDto) {
        return await this.userService.updateUser(id, updateUserDto);
    }

    @Put(':id')
    async archiveUser(@Param('id') id: string) {
        return await this.userService.archiveUser(id);
    }

    @Delete(':id/hard')
    async hardDeleteUser(@Param('id') id: string) {
        return await this.userService.hardDeleteUser(id);
    }
}
