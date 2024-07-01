import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class FetchUserMiddleware implements NestMiddleware {
    constructor(
        private readonly jwtService: JwtService
    ) { }

    async use(req: any, res: Response, next: NextFunction) {
        const token = this.extractTokenFromHeader(req);

        if (token) {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.secret,
            });
            const userId: number = payload.userId;
            const username: string = payload.username;

            const user = { userId, username }
            req.user = user;
        }

        next();
    }

    extractTokenFromHeader(req: Request): string | undefined {
        const [type, token] = req.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}