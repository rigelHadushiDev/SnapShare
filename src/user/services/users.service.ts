import { Injectable, NotFoundException, UnauthorizedException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from '../user.entity';
import { Post } from 'src/post/post.entity';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import { UpdateUserDto } from '../dtos/UpdateUserDto';
import { UserProvider } from './user.provider';
import { CreateUserReq, UserInfoDto } from '../dtos/CreateUser.dto';
import { Network } from 'src/network/entities/network.entity';
import { SnapShareUtility } from 'src/common/utilities/snapShareUtility.utils';
import { GetUserDataRes } from '../dtos/GetUserData.dto';
const fs = require('fs');

@Injectable()
export class UsersService {

    public currUserID: number;
    public currUserName: string;

    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider) {
        this.currUserID = this.userProvider.getCurrentUser()?.userId;
        this.currUserName = this.userProvider.getCurrentUser()?.username;
    }


    async createUser(createUserDto: CreateUserReq) {

        let { email, username, password } = createUserDto;
        // Check if the user with the given email already exists
        const existingUser = await this.entityManager.findOne(User, {
            where: [{ email }, { username }],
        });

        if (existingUser) {
            // Determine which field(s) caused the conflict
            if (existingUser.email === email) {
                throw new ConflictException('emailTaken');
            } else if (existingUser.username === username) {
                throw new ConflictException('usernameTaken');
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

        let createdUser = await this.entityManager.save(newUser);

        const { password: excludedPassword, ...userInfo } = createdUser;

        return { message: "userCreatedSuccessfully", userInfo };
    }


    async getUserById(userId: number): Promise<User | undefined> {
        const user = await this.entityManager.findOne(User, {
            where: {
                userId: userId,
                archive: false
            }
        });

        if (!user) {
            throw new NotFoundException("User not found or is archived");
        }

        return user;
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        const user = await this.entityManager.findOne(User, {
            where: {
                username: username,
                archive: false
            }
        });

        if (!user) {
            throw new NotFoundException("User not found or is archived");
        }

        return user;
    }

    async getCurrUserData(userId: number): Promise<GetUserDataRes> {

        let resp;

        let user = await this.getUserById(userId);

        let { password: excludedPassword, ...userInfo } = user;

        let followStatus = '';

        if (userId === this.currUserID) {
            followStatus = 'isCurrentUser';

        } else {

            const networkRecord = await this.entityManager
                .createQueryBuilder(Network, 'n')
                .where('n.followerId = :currUserID', { currUserID: this.currUserID })
                .andWhere('n.followeeId = :userId', { userId })
                .andWhere('n.deleted = :deleted', { deleted: 0 })
                .getOne();

            if (!networkRecord) {
                if (!userInfo.isPrivate) {
                    followStatus = 'notFollowingPublicUser';
                } else {
                    followStatus = 'notFollowingPrivateUser';
                }
            }
            else if (networkRecord && networkRecord.pending && userInfo.isPrivate) {
                followStatus = 'requested';
            } else if (networkRecord && !networkRecord.pending) {
                followStatus = 'connected';
            }
        }

        if (userInfo?.profileImg)
            userInfo.profileImg = SnapShareUtility.urlConverter(userInfo.profileImg);


        resp = { userInfo, followStatus };

        return resp;
    }


    async updateUser(updateUserDto: UpdateUserDto): Promise<{ user: UserInfoDto, message: string }> {

        const userId: number = this.currUserID;

        const user = await this.getUserById(userId);

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

        const { password: __, ...userInfo } = updatedUser;

        return { message: 'userModifiedSucesfully', user: userInfo };
    }

    async archiveUser(): Promise<{ user: UserInfoDto, message: string }> {

        const userId: number = this.currUserID;

        const user = await this.getUserById(userId);

        await this.entityManager.update(User, userId, { archive: true });

        const { password: excludedPassword, ...userInfo } = user;

        return { message: 'UserArchivedSuccessfully', user: userInfo };
    }

    async hardDeleteUser(): Promise<{ user: UserInfoDto, message: string }> {

        const userId: number = this.currUserID;

        const user = await this.getUserById(userId);

        await this.entityManager.transaction(async (transactionalEntityManager: EntityManager) => {
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
                        throw new InternalServerErrorException('errorDeletingPost');
                    }
                }
            }
        });

        const { password: excludedPassword, ...userInfo } = user;

        return { message: 'userDeletedSuccessfully', user: userInfo };
    }


}
