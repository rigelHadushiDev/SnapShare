import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../../user/services/users.service';
import { PostService } from '../../post/services/post.service';
import { NetworkService } from '../../network/network.service';
import { User } from '../../user/user.entity';
import { EntityManager } from 'typeorm';
import { Post } from 'src/post/post.entity';

@Injectable()
export class PostAccessGuard implements CanActivate {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly networkService: NetworkService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { user, params, body }: { user: User; params: { postId?: number }; body: { postId?: number } } = request;

        if (!user || !params) {
            throw new ForbiddenException('Unauthorized access');
        }

        const userId = user.userId;
        const postId = params.postId ?? body.postId;


        const post = await this.entityManager.findOne(Post, {
            where: {
                postId: postId,
                archive: false
            }
        });

        if (!post)
            throw new NotFoundException(`postNotFound`)

        const postUserId = post.userId;

        const postUser = await this.entityManager.findOne(User, {
            where: {
                userId: postUserId,
                archive: false
            }
        });

        if (!postUser)
            throw new NotFoundException(`userNotFound`)


        if (postUser?.isPrivate === true && userId !== postUserId) {
            const responseMessage = await this.networkService.isfollowedBy(postUserId);
            if (responseMessage?.message === 'isntConnectedTo') {
                throw new ForbiddenException('nonFriendPrivateAccList');
            }

        }
        return true;
    }
}