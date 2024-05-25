import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './dtos/UpdateUserDto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly entityManager: EntityManager) { }

    async createUser(email: string, username: string, password: string): Promise<User> {
        // Check if the user with the given email already exists
        const existingUser = await this.entityManager.findOne(User, {
            where: [{ email }, { username }],
        });

        if (existingUser) {
            // Determine which field(s) caused the conflict
            if (existingUser.email === email) {
                throw new ConflictException('User with this email already exists');
            } else if (existingUser.username === username) {
                throw new ConflictException('User with this username already exists');
            }
        }

        // Create a new user
        const saltOrRounds = 10;
        password = await bcrypt.hash(password, saltOrRounds);
        const newUser = this.entityManager.create(User, {
            email,
            username,
            password,
        });
        return this.entityManager.save(newUser);
    }

    // this two can be needed later so im just leaving them 

    async getUserById(userId: string): Promise<User | undefined> {
        const user = this.entityManager.findOneBy(User, { userId });
        if (!user) {
            throw new NotFoundException("userNotFound");
        }
        return user;
    }

    async findOneByUsername(username: string): Promise<User | undefined> {
        const user = this.entityManager.findOneBy(User, { username });
        if (!user) {
            throw new NotFoundException("userNotFound");
        }
        return user;
    }


    //-------------------------------------------------------


    async updateUser(
        userId: string,
        updateUserDto: UpdateUserDto,
    ): Promise<User | undefined> {

        const user = await this.getUserById(userId);
        if (!user) {
            return undefined;
        }


        const { ...updateFields } = updateUserDto;

        // Update the fields if they are present in the DTO
        Object.keys(updateFields).forEach((key) => {
            if (updateUserDto[key] !== undefined) {
                user[key] = updateUserDto[key];
            }
        })



    }


    // turn this into archieve
    async softDeleteUser(userId: string): Promise<User | undefined> {
        await this.entityManager.update(User, userId, { deleted: true });
        return this.entityManager.findOneBy(User, { userId });
    }

    async hardDeleteUser(userId: string): Promise<User | undefined> {
        const user = await this.entityManager.findOneBy(User, { userId });
        if (user) {
            await this.entityManager.remove(user);
        }
        return user;
    }



}
