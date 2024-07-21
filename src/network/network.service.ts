import { BadRequestException, ForbiddenException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { UserProvider } from 'src/user/services/user.provider';
import { Network } from './entities/network.entity';
import { EntityManager } from 'typeorm';
import { User } from 'src/user/user.entity';
import { GeneralResponse } from 'src/post/dtos/GeneralResponse';
import { ConnectionsCntRes } from './responses/connectionsCntRes';
import { Post } from 'src/post/post.entity';
import { SnapShareUtility } from 'src/common/utilities/snapShareUtility.utils';
import { UserListRes } from './responses/UserListRes';

@Injectable()
export class NetworkService {
    public UserID: number;

    constructor(private readonly userProvider: UserProvider, private readonly entityManager: EntityManager) {
        this.UserID = this.userProvider.getCurrentUser()?.userId;
    }

    async followUser(followeeId: number) {

        const userId: number = this.UserID;
        let resp = new GeneralResponse();

        const user = await this.entityManager
            .createQueryBuilder(User, 'user')
            .select('*')
            .where('user.userId = :followeeId', { followeeId })
            .andWhere('user.archive = :archiveStatus', { archiveStatus: false })
            .getRawOne();

        if (!user)
            throw new NotFoundException(`userNotFound`);

        let sentFriendRequest = await this.entityManager
            .createQueryBuilder()
            .from(Network, 'network')
            .select('*')
            .where("network.followerId = :followerId", { followerId: userId })
            .andWhere('network.followeeId = :followeeId', { followeeId: followeeId })
            .andWhere('network.deleted = :deletedStatus', { deletedStatus: false })
            .getRawMany();


        if (sentFriendRequest?.length > 0)
            throw new BadRequestException(`followRequestAlreadySent`)

        if (user?.isPrivate) {

            await this.entityManager
                .createQueryBuilder()
                .insert()
                .into(Network)
                .values({
                    followerId: userId,
                    followeeId,
                    pending: true
                })
                .execute();

            resp.message = "userReqToBeFollowed";

        } else {

            await this.entityManager
                .createQueryBuilder()
                .insert()
                .into(Network)
                .values({
                    followerId: userId,
                    followeeId,
                    createdAt: new Date()
                })
                .execute();

            resp.message = "userSuccessfullyFollowed";
        }

        resp.status = HttpStatus.OK;
        return resp;
    }


    async unfollowUser(followeeId: number) {

        const currUserId: number = this.UserID;
        let resp = new GeneralResponse();

        const user = await this.entityManager
            .createQueryBuilder(User, 'user')
            .select('*')
            .where('user.userId = :followeeId', { followeeId })
            .andWhere('user.archive = :archiveStatus', { archiveStatus: false })
            .getRawOne();

        if (!user)
            throw new NotFoundException(`userNotFound`);

        const networkConnection = await this.entityManager
            .createQueryBuilder()
            .from(Network, 'network')
            .select(['network.networkId', 'network.pending'])
            .where("network.followerId = :userId", { userId: currUserId })
            .andWhere('network.deleted = :deletedStatus', { deletedStatus: false })
            .getRawOne();

        if (!networkConnection)
            throw new NotFoundException(`networkConnectionNotFound`);


        await this.entityManager
            .createQueryBuilder()
            .update(Network)
            .set({ deleted: true })
            .where("followerId = :userId", { userId: currUserId })
            .andWhere('followeeId = :followeeId', { followeeId })
            .andWhere('deleted = :deletedStatus', { deletedStatus: false })
            .execute();

        resp.status = HttpStatus.OK;
        resp.message = networkConnection?.pending ? "userRevokedTheRequest" : "userUnfollowedSuccessfully";

        return resp;
    }


    async removeConnection(followeeId: number) {

        const currUserID = this.UserID;
        let resp = new GeneralResponse();

        let user = await this.entityManager
            .createQueryBuilder()
            .from(User, 'user')
            .select('*')
            .where("user.userId = :followeeId", { followeeId: followeeId })
            .andWhere('user.archive = :archiveStatus', { archiveStatus: false })
            .getRawOne();

        if (!user)
            throw new NotFoundException(`userNotFound`);

        let networkConnection = await this.entityManager
            .createQueryBuilder()
            .from(Network, 'network')
            .select('*')
            .where("network.followerId = :userId AND network.followeeId = :followeeId AND network.deleted = :deletedStatus", {
                userId: currUserID,
                followeeId: followeeId,
                deletedStatus: false
            })
            .orWhere("network.followerId = :followeeId AND network.followeeId = :userId AND network.deleted = :deletedStatus", {
                followeeId: followeeId,
                userId: currUserID,
                deletedStatus: false
            })
            .getRawMany();

        if (networkConnection?.length === 0)
            throw new BadRequestException(`cantRemoveNonFollowingUser`)

        for (const connection of networkConnection) {

            await this.entityManager
                .createQueryBuilder()
                .update(Network)
                .set({ deleted: true })
                .where("networkId = :networkId", { networkId: connection?.networkId })
                .andWhere('deleted = :deletedStatus', { deletedStatus: false })
                .execute();

        }

        resp = { status: HttpStatus.OK, message: "userRemovedSuccessfully" };
        return resp;

    }

    async connectionCount(userId: number) {

        let resp = new ConnectionsCntRes();

        let user = await this.entityManager
            .createQueryBuilder()
            .from(User, 'user')
            .select('*')
            .where("user.userId = :followeeId", { followeeId: userId })
            .andWhere('user.archive = :archiveStatus', { archiveStatus: false })
            .getRawOne();


        if (!user)
            throw new NotFoundException(`userNotFound`);

        let followingCount = await this.entityManager
            .createQueryBuilder()
            .from(Network, 'network')
            .select('COUNT(*)', 'counter')
            .where("network.followerId = :userId AND network.deleted = :deletedStatus AND network.pending = :pendingStatus", {
                userId: userId,
                deletedStatus: false,
                pendingStatus: false
            })
            .getRawOne();

        followingCount = followingCount?.counter || 0;

        let followersCount = await this.entityManager
            .createQueryBuilder()
            .from(Network, 'network')
            .select('COUNT(*)', 'counter')
            .where("network.followeeId = :followeeId AND network.deleted = :deletedStatus AND network.pending = :pendingStatus", {
                followeeId: userId,
                deletedStatus: false,
                pendingStatus: false
            })
            .getRawOne();

        followersCount = followersCount?.counter || 0;

        resp = { followersCount: followersCount, followingCount: followingCount }

        return resp;
    }

    async getFollowersList(userId: number, postsByPage: number = 10, page: number = 1) {

        let resp = new UserListRes;

        const currUserId = this.UserID;

        let skip: number = (page - 1) * postsByPage

        const user = await this.entityManager
            .createQueryBuilder(User, 'user')
            .select('*')
            .where('user.userId = :userId', { userId })
            .andWhere('user.archive = :archiveStatus', { archiveStatus: false })
            .getRawOne();

        if (!user)
            throw new NotFoundException(`userNotFound`);


        const currUserFriend = await this.entityManager
            .createQueryBuilder(Network, 'network')
            .select('*')
            .where('network.followerId = :currUserId', { currUserId })
            .andWhere('network.pending = :pendingStatus', { pendingStatus: false })
            .andWhere('network.followeeId = :followeeId', { followeeId: userId })
            .getRawOne();

        if (user?.isPrivate && !currUserFriend)
            throw new ForbiddenException(`nonFriendPrivateAccList`);

        const query = `SELECT
            u."userId",
            u."username",
            u."profileImg",
            CASE 
                WHEN EXISTS(
                    SELECT 1 
                    FROM network n2 
                    WHERE n2."followerId" = $1
                      AND n2."followeeId" = u."userId" 
                      AND n2."pending" = false 
                      AND n2."deleted" = false
                ) THEN true 
                ELSE false 
            END AS "isFollowedbyCurrUser"
        FROM 
            network n
        JOIN
            "user" u ON n."followerId" = u."userId"
        WHERE
            n."followeeId" = $2
            AND n."pending" = false 
            AND n."deleted" = false
        LIMIT $3 OFFSET $4;`;


        const followersList = await this.entityManager.query(query, [currUserId, userId, postsByPage, skip]);

        for (const follower of followersList) {
            if (follower?.profileImg)
                follower.profileImg = SnapShareUtility.urlConverter(follower.profileImg);
        }


        resp = { userId: userId, username: followersList.username, profileImg: followersList.profileImg, isFollowedbyCurrUser: followersList.isFollowedbyCurrUser }
        return resp;
    };

    async getFollowingList(userId: number, postsByPage: number = 10, page: number = 1) {

        let resp = new UserListRes;

        const currUserId = this.UserID;

        let skip: number = (page - 1) * postsByPage

        const user = await this.entityManager
            .createQueryBuilder(User, 'user')
            .select('*')
            .where('user.userId = :userId', { userId })
            .andWhere('user.archive = :archiveStatus', { archiveStatus: false })
            .getRawOne();

        if (!user)
            throw new NotFoundException(`userNotFound`);


        const currUserFriend = await this.entityManager
            .createQueryBuilder(Network, 'network')
            .select('*')
            .where('network.followerId = :currUserId', { currUserId })
            .andWhere('network.pending = :pendingStatus', { pendingStatus: false })
            .andWhere('network.followeeId = :followeeId', { followeeId: userId })
            .getRawOne();

        if (user?.isPrivate && !currUserFriend)
            throw new ForbiddenException(`nonFriendPrivateAccList`);

        const query = `SELECT
            u."userId",
            u."username",
            u."profileImg",
            CASE 
                WHEN EXISTS(
                    SELECT 1 
                    FROM network n2 
                    WHERE n2."followerId" = $1
                      AND n2."followeeId" = u."userId" 
                      AND n2."pending" = false 
                      AND n2."deleted" = false
                ) THEN true 
                ELSE false 
            END AS "isFollowedbyCurrUser"
        FROM 
            network n
        JOIN
            "user" u ON n."followeeId" = u."userId"
        WHERE
            n."followerId" = $2
            AND n."pending" = false 
            AND n."deleted" = false
        LIMIT $3 OFFSET $4;`;


        const followeeList = await this.entityManager.query(query, [currUserId, userId, postsByPage, skip]);

        for (const followee of followeeList) {
            if (followee?.profileImg)
                followee.profileImg = SnapShareUtility.urlConverter(followeeList.profileImg);
        }


        resp = { userId: userId, username: followeeList.username, profileImg: followeeList.profileImg, isFollowedbyCurrUser: followeeList.isFollowedbyCurrUser }
        return resp;
    };

    async handleFollowRequest(senderId: number, inviteAction: boolean) {

        const currUserId = this.UserID;
        let resp = new GeneralResponse;

        const user = await this.entityManager
            .createQueryBuilder(User, 'user')
            .select('*')
            .where('user.userId = :senderId', { senderId })
            .andWhere('user.archive = :archiveStatus', { archiveStatus: false })
            .getRawOne();

        if (!user)
            throw new NotFoundException(`userNotFound`);

        let usersConnection = await this.entityManager
            .createQueryBuilder()
            .from(Network, 'network')
            .select('*')
            .where("network.followerId = :senderId", { senderId: senderId })
            .andWhere('network.followeeId = :currUserId', { currUserId: currUserId })
            .andWhere('network.deleted = :deletedStatus', { deletedStatus: false })
            .andWhere('network.pending = :pendingStatus', { pendingStatus: true })
            .getRawOne();

        if (!usersConnection)
            throw new NotFoundException(`followRequestNotFound`);

        if (!inviteAction) {
            await this.entityManager
                .createQueryBuilder()
                .update(Network)
                .set({ deleted: true })
                .where("networkId = :networkId", { networkId: usersConnection?.networkId })
                .execute();

            resp.message = "userRequestRejected";

        } else {

            await this.entityManager
                .createQueryBuilder()
                .update(Network)
                .set({
                    pending: false,
                    createdAt: new Date()
                })
                .where("networkId = :networkId", { networkId: usersConnection?.networkId })
                .execute();

            resp.message = "userRequestAccepted";
        }

        resp.status = HttpStatus.OK;

        return resp;
    }


    async isfollowedBy(followeeId: number) {
        let resp = { message: 'isntConnectedTo' }

        const story = await this.entityManager
            .createQueryBuilder()
            .from(Network, 'network')
            .select('*')
            .where('network.followerId = :followerId', { followerId: this.UserID })
            .andWhere('network.followeeId = :followeeId', { followeeId: followeeId })
            .getOne();

        if (story)
            resp.message = 'isConnectedTo';

        return resp;
    }
}
