import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../../user/services/users.service';
import { PostService } from '../../post/services/post.service';
import { NetworkService } from '../../network/network.service';
import { User } from '../../user/user.entity';

@Injectable()
export class PostAccessGuard implements CanActivate {
    constructor(
        private readonly usersService: UsersService,
        private readonly postService: PostService,
        private readonly networkService: NetworkService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { user, params }: { user: User; params: { postId: number } } = request;

        if (!user || !params) {
            throw new ForbiddenException('Unauthorized access');
        }

        const userId = user.userId;
        const postId = params.postId;

        const currentUser = await this.usersService.getUserById(userId);

        const post = await this.postService.findPostById(postId);

        const postUserId = post.userId;

        if (currentUser?.isPrivate === true && userId !== postUserId) {
            const responseMessage = await this.networkService.isfollowedBy(postUserId);
            if (responseMessage?.message === 'isntConnectedTo') {
                throw new ForbiddenException('nonFriendPrivateAccList');
            }

        }
        return true;
    }
}