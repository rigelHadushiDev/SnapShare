import { Inject, Injectable, Request, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';

@Injectable({ scope: Scope.REQUEST })
export class UserProvider {
    constructor(@Inject(REQUEST) private request: any) { }

    getCurrentUser(): any {
        return this.request['user'];
    }
}