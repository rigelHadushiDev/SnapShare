import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../../user/services/users.service';

import { NetworkService } from '../../network/network.service';
import { User } from '../../user/user.entity';
import { StoryService } from 'src/story/story.service';

@Injectable()
export class StoryAcessGuard implements CanActivate {
    constructor(
        private readonly usersService: UsersService,
        private readonly storyService: StoryService,
        private readonly networkService: NetworkService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { user, params }: { user: User; params: { storyId: number } } = request;

        if (!user || !params) {
            throw new ForbiddenException('Unauthorized access');
        }

        const userId = user.userId;
        const storyId = params.storyId;

        const currentUser = await this.usersService.getUserById(userId);

        const story = await this.storyService.findStoryById(storyId);

        const storyUserId = story.userId;

        if (currentUser?.isPrivate === true && userId !== storyUserId) {
            const responseMessage = await this.networkService.isfollowedBy(storyUserId);
            if (responseMessage?.message === 'isntConnectedTo') {
                throw new ForbiddenException('nonFriendPrivateAccList');
            }
        }
        return true;
    }
}