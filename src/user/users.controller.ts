import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Post,
    Put,
    ValidationPipe,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/CreateUserDto';
import { UpdateUserDto } from './dtos/UpdateUserDto';
import { UsersService } from './users.service';
import { Public } from 'src/decorators/public.decorator';


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

    @Get()
    async getAllUsers() {
        return await this.userService.getAllUsers();
    }

    @Get(':id')
    async getUserById(@Param('id') id: string) {
        const user = await this.userService.getUserById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    @Put(':id')
    async updateUser(@Param('id') id: string, @Body(new ValidationPipe()) updateUserDto: UpdateUserDto) {
        const updatedUser = await this.userService.updateUser(id, updateUserDto);
        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }
        return { message: 'User updated successfully', user: updatedUser };
    }

    @Delete(':id')
    async softDeleteUser(@Param('id') id: string) {
        const deletedUser = await this.userService.softDeleteUser(id);
        if (!deletedUser) {
            throw new NotFoundException('User not found');
        }
        return { message: 'User soft-deleted successfully', user: deletedUser };
    }

    @Delete(':id/hard')
    async hardDeleteUser(@Param('id') id: string) {
        const deletedUser = await this.userService.hardDeleteUser(id);
        if (!deletedUser) {
            throw new NotFoundException('User not found');
        }
        return { message: 'User hard-deleted successfully', user: deletedUser };
    }
}
