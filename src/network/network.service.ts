import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { UserProvider } from 'src/user/user.provider';
import { Network } from './entities/network.entity';
import { EntityManager } from 'typeorm';
import { User } from 'src/user/user.entity';
import { GeneralResponse } from 'src/post/dtos/GeneralResponse';

@Injectable()
export class NetworkService {
    public UserID: number;

    constructor(private readonly userProvider: UserProvider, private readonly entityManager: EntityManager) {
        this.UserID = this.userProvider.getCurrentUser()?.userId;
    }


    async followUser(followeeId: number) {

        const userId: number = this.UserID;
        let resp = new GeneralResponse();

        let user = await this.entityManager
            .createQueryBuilder()
            .from(User, 'user')
            .select('*')
            .where("user_id = :followeeId", { followeeId: followeeId })
            .andWhere('archieve = :archieveStatus', { archieveStatus: false })
            .getOne();


        if (!user)
            throw new NotFoundException(`userNotFound`);

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

        let user = await this.entityManager
            .createQueryBuilder()
            .from(User, 'user')
            .select('*')
            .where("user_id = :followeeId", { followeeId: followeeId })
            .andWhere('archieve = :archieveStatus', { archieveStatus: false })
            .getOne();

        if (!user)
            throw new NotFoundException(`userIsNotFound`);

        const networkConnection = await this.entityManager
            .createQueryBuilder()
            .from(Network, 'network')
            .select(['networkId', 'pending'])
            .where("followerId = :userId", { userId: currUserId })
            .andWhere('deleted = :deletedStatus', { deletedStatus: false })
            .getOne();

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
            .select('isPrivate')
            .where("user_id = :followeeId", { followeeId: followeeId })
            .andWhere('archieve = :archieveStatus', { archieveStatus: false })
            .getOne();

        if (!user)
            throw new NotFoundException(`userNotFound`);

        let networkConnection = await this.entityManager
            .createQueryBuilder()
            .from(Network, 'network')
            .select('*')
            .where("followerId = :userId AND followeeId = :followeeId AND deleted = :deletedStatus", {
                userId: currUserID,
                followeeId: followeeId,
                deletedStatus: false
            })
            .orWhere("followerId = :followeeId AND followeeId = :userId AND deleted = :deletedStatus", {
                followeeId: followeeId,
                userId: currUserID,
                deletedStatus: false
            })
            .getMany();

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

    // kethji ne nje metode qe merr count quaje ConnectionsCount dhe do kesh followersCount dhe followintgCount
    async followingCount(followeeId: number) {

        let currUserID: number = this.UserID;

        // zevenedesoj me response qe do te ket followingCounter
        let resp = { followingCounter: 0 }

        let followingCount = await this.entityManager
            .createQueryBuilder()
            .from(Network, 'network')
            .select('COUNT(*)', 'counter')
            .where("followerId = :userId AND followeeId = :followeeId AND deleted = :deletedStatus", {
                userId: currUserID,
                followeeId: followeeId,
                deletedStatus: false
            })
            .getRawOne();

        let counter = followingCount?.counter || 0;
        resp = counter;

        return counter;
    }



    async followersCount(followeeId: number) {

        let currUserID: number = this.UserID;

        // zevenedesoj me response qe do te ket followersCount
        let resp = { followersCount: 0 }

        let followersCount = await this.entityManager
            .createQueryBuilder()
            .from(Network, 'network')
            .select('COUNT(*)', 'counter')
            .where("followerId = :followeeId AND followeeId = :userId AND deleted = :deletedStatus", {
                followeeId: followeeId,
                userId: currUserID,
                deletedStatus: false
            })
            .getRawOne();

        let counter = followersCount?.counter || 0;
        resp = counter;

        return counter;
    }

    // metodat getFolloers/getFollowing me pagination getFollowing 
    //shiko nese jan public/vs privat nese jane privat athere nqs i ke connection mund ti shikosh
    // shiko nese useri i ka follow dhe nqs i ka follow do te jete followed true nese jo followed false 


}
