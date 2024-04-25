import { Inject, Injectable, Request, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { EntityManager } from 'typeorm';
import { User } from './user.entity';

@Injectable({ scope: Scope.REQUEST })
export class UserProvider {
    constructor(@Inject(REQUEST) private request: any, private readonly entityManager: EntityManager) { }

    getCurrUserName(): any {
        let user = this.request['user'];
        return user;
    }
    async getCurrUserId() {
        let username = this.request['user'].username;
        const userID = (await this.entityManager.findOneBy(User, { username })).userId;
        return userID;
    }


}