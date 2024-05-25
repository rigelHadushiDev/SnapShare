import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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

        let createdUser = this.entityManager.save(newUser);

        return createdUser;
    }

    async getUserById(userId: string): Promise<User | undefined> {
        const user = this.entityManager.findOneBy(User, { userId });
        if (!user) {
            throw new NotFoundException("userNotFound");
        }
        return user;
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        const user = this.entityManager.findOneBy(User, { username });
        if (!user) {
            throw new NotFoundException("userNotFound");
        }
        return user;
    }

    async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<{ user: User, message: string }> {

        const user = await this.getUserById(userId);

        if (!user) {
            throw new BadRequestException("userNotFound")
        }

        const { ...updateFields } = updateUserDto;

        for (const key of Object.keys(updateFields)) {

            if (updateUserDto[key] !== undefined && key === "email") {

                const usedEmail = await this.entityManager
                    .createQueryBuilder()
                    .select('COUNT(*)', 'count')
                    .from(User, 'user')
                    .where('user.email = :email', { email: updateUserDto[key] })
                    .andWhere('user.userId != :userId', { userId: user.userId })
                    .getRawOne();

                let { count } = usedEmail;

                if (count > 0)
                    throw new ConflictException("emailIsTaken");
            }

            if (updateUserDto[key] !== undefined && key === "username") {

                const usedUsername = await this.entityManager
                    .createQueryBuilder()
                    .select('COUNT(*)', 'count')
                    .from(User, 'user')
                    .where('user.username = :username', { username: updateUserDto[key] })
                    .andWhere('user.userId != :userId', { userId: user.userId })
                    .getRawOne();


                let { count } = usedUsername;

                if (count > 1)
                    throw new ConflictException("usernameIsTaken");
            }

            if (updateUserDto[key] !== undefined) {
                user[key] = updateUserDto[key];
            }
        }

        const updatedUser = await this.entityManager.save(User, user);

        return { message: 'UserModifiedSucesfully', user: updatedUser };
    }

    async archiveUser(userId: string): Promise<{ user: User, message: string }> {
        await this.entityManager.update(User, userId, { archive: true });

        const user: any = await this.entityManager.findOne(User, { where: { userId } });
        if (!user) {
            throw new NotFoundException('userNotFound');
        }
        return { message: "userArchivedSucesfully", user: user };
    }

    async hardDeleteUser(userId: string): Promise<{ user: User, message: string }> {
        const user = await this.entityManager.findOneBy(User, { userId });
        if (user) {
            await this.entityManager.remove(user);
        } else {
            throw new NotFoundException('userNotFound');
        }
        return { message: 'UserDeletedSuccessfully', user: user };
    }



}
