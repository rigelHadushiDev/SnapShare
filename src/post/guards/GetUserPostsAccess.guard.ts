import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../../user/services/users.service';
import { PostService } from '../../post/services/post.service';
import { NetworkService } from '../../network/network.service';
import { User } from '../../user/user.entity';
import { EntityManager } from 'typeorm';
import { Post } from 'src/post/post.entity';

@Injectable()
export class GetUserPostsAccessGuard implements CanActivate {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly networkService: NetworkService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { user, params }: { user: User; params: { userId: number } } = request;

        if (!user || !params) {
            throw new ForbiddenException('Unauthorized access');
        }

        const currUserId = user.userId;
        const userId = params.userId;


        let userFromParam = await this.entityManager.findOne(User, {
            where: {
                userId: userId,
                archive: false
            }
        });
        const currUser = await this.entityManager.findOne(User, {
            where: {
                userId: currUserId,
                archive: false
            }
        });

        if (!userFromParam || !currUser)
            throw new NotFoundException(`userNotFound`)


        if (userFromParam?.isPrivate === true && userId !== currUserId) {
            const responseMessage = await this.networkService.isfollowedBy(userId);
            if (responseMessage?.message === 'isntConnectedTo') {
                throw new ForbiddenException('nonFriendPrivateAccList');
            }

        }
        return true;
    }
}