import { Injectable, NotFoundException, UnauthorizedException, InternalServerErrorException, ConflictException, BadRequestException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from './user.entity';
import { Post } from 'src/post/post.entity';
import { UserProvider } from './user.provider';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import { UpdateUserDto } from './dtos/UpdateUserDto';
const fs = require('fs');

@Injectable()
export class UsersService {

    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider) { }

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

    async postProfilePic(file: any) {
        let resp: any

        const userId = this.userProvider.getCurrentUser().userId;
        const filePath: string = file.path;
        let user = new User();

        await this.entityManager.transaction(async transactionalEntityManager => {
            user.userId = userId;
            user.profileImg = filePath;

            await transactionalEntityManager.save(User, user);
        });

        resp = user;
        return resp;
    };


    async getProfilePic() {
        const currUser: { userId: string } = this.userProvider.getCurrentUser();

        const user = await this.entityManager
            .createQueryBuilder()
            .select()
            .from(User, 'user')
            .where('user.userId = :userId', { userId: currUser.userId })
            .getRawOne();

        if (user && user.profileImg) {
            const pathParts = user.profileImg.split(/[\/\\]/);
            user.profileImg = `${process.env.DOMAIN_NAME}/post/display/profileImg/${pathParts[pathParts.length - 3]}/${pathParts[pathParts.length - 1]}`;
        }

        return user;
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

    // this can be refactored with a switch later
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
            if (updateUserDto[key] !== undefined && key === "password") {

                const saltOrRounds = 10;
                const hashedPassword = await bcrypt.hash(updateUserDto[key], saltOrRounds);
                user[key] = hashedPassword;
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

        const currUser = this.userProvider.getCurrentUser()?.userId;

        const user: any = await this.entityManager.findOne(User, { where: { userId } });
        if (!user) {
            throw new NotFoundException('userNotFound');
        } else if (user.userId !== currUser) {
            throw new UnauthorizedException('notAuthorizedUser');
        }
        return { message: "userArchivedSucesfully", user: user };
    }

    async hardDeleteUser(userId: string): Promise<{ user: User, message: string }> {

        const currUser = this.userProvider.getCurrentUser()?.userId;
        const user = await this.entityManager.findOneBy(User, { userId });

        if (!user) {
            throw new NotFoundException('userNotFound');
        }
        else if (user.userId !== currUser) {
            throw new UnauthorizedException('notAuthorizedUser');
        }

        return await this.entityManager.transaction(async (transactionalEntityManager: EntityManager) => {
            const posts: Post[] = await transactionalEntityManager
                .createQueryBuilder(Post, 'post')
                .where('post.userId = :userId', { userId: user.userId })
                .getMany();

            await transactionalEntityManager.remove(User, user);

            for (const post of posts) {
                if (post?.media) {
                    const filePath = path.resolve(post.media);
                    try {
                        await fs.promises.unlink(filePath);
                    } catch (err) {
                        throw new InternalServerErrorException('issueDeletingPost');
                    }
                }
            }

            return { message: 'UserDeletedSuccessfully', user: user };
        });
    }





























}
