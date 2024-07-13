import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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
            .select('isPrivate')
            .where("user_id = :followeeId", { followeeId: followeeId })
            .getOne();


        if (user) {

            if (user?.isPrivate) {

                await this.entityManager
                    .createQueryBuilder()
                    .insert()
                    .into(Network)
                    .values({
                        followerId: userId,
                        followeeId,
                        createdAt: new Date(),
                    })
                    .returning('*')
                    .execute();

                resp.message = "userReqToBeMyNetwork";

            } else {
                await this.entityManager
                    .createQueryBuilder()
                    .insert()
                    .into(Network)
                    .values({
                        followerId: userId,
                        followeeId,
                        pending: true
                    })
                    .returning('*')
                    .execute();

                resp.message = "userAddedInNetwork";
            }
            resp.status = HttpStatus.OK;
        }
        else {
            throw new NotFoundException(`userNotFound`);
        }

        return resp;
    }


    async unfollowUser(followeeId: number) {

        const currUserId: number = this.UserID;
        let resp = new GeneralResponse();

        let user = await this.entityManager
            .createQueryBuilder()
            .from(User, 'user')
            .select('isPrivate')
            .where("user_id = :followeeId", { followeeId: followeeId })
            .getOne();


        if (user) {

            const networkConnection = await this.entityManager
                .createQueryBuilder()
                .from(Network, 'network')
                .select(['networkId', 'pending'])
                .where("followerId = :userId", { userId: currUserId })
                .getOne();

            if (networkConnection) {

                await this.entityManager
                    .createQueryBuilder()
                    .update(Network)
                    .set({ deleted: true })
                    .where("followerId = :userId", { userId: currUserId })
                    .andWhere('followeeId = :followeeId', { followeeId })
                    .execute();

                resp.status = HttpStatus.OK;
                resp.message = networkConnection?.pending ? "userRevokedTheRequest" : "userRemovedFromNetwork";

            } else {
                throw new NotFoundException(`networkConnectionNotFound`);
            }
        }
        else {
            throw new NotFoundException(`userNotFound`);
        }
        return resp;
    }


    async removeUser(followeeId: number) {

        let user = await this.entityManager
            .createQueryBuilder()
            .from(User, 'user')
            .select('isPrivate')
            .where("user_id = :followeeId", { followeeId: followeeId })
            .getOne();


        if (!user)
            throw new NotFoundException(`userNotFound`);
    }
}
