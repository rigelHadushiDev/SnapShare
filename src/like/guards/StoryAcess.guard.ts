import { CanActivate, ExecutionContext, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../../user/services/users.service';

import { NetworkService } from '../../network/network.service';
import { User } from '../../user/user.entity';
import { StoryService } from 'src/story/story.service';
import { EntityManager } from 'typeorm';
import { Story } from 'src/story/story.entity';

@Injectable()
export class StoryAcessGuard implements CanActivate {
    constructor(
        private readonly entityManager: EntityManager,
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

        const story = await this.entityManager.findOne(Story, { where: { storyId: storyId, archive: false } })

        if (!story)
            throw new NotFoundException(`storyNotFound`);

        const storyUserId = story.userId;

        const currentUser = await this.entityManager.findOne(User, {
            where: {
                userId: storyUserId,
                archive: false
            }
        });

        if (!currentUser)
            throw new NotFoundException(`userNotFound`)

        if (currentUser?.isPrivate === true && userId !== storyUserId) {
            const responseMessage = await this.networkService.isfollowedBy(storyUserId);
            if (responseMessage?.message === 'isntConnectedTo') {
                throw new ForbiddenException('nonFriendPrivateAccList');
            }
        }
        return true;
    }
}