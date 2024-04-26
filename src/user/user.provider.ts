import { Inject, Injectable, Request, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { EntityManager } from 'typeorm';


@Injectable({ scope: Scope.REQUEST })
export class UserProvider {
    constructor(@Inject(REQUEST) private request: any, private readonly entityManager: EntityManager) { }

    getCurrentUserId(): any {
        let userId = this.request['user']?.userId;
        return userId;
    }
}