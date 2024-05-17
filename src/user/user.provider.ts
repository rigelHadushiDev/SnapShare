import { Inject, Injectable, Request, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { EntityManager } from 'typeorm';


@Injectable({ scope: Scope.REQUEST })
export class UserProvider {
    constructor(@Inject(REQUEST) public request: any, private readonly entityManager: EntityManager) { }

    public getCurrentUser(): any {
        return this.request['user'];
    }
}