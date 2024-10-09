import { Injectable, NotFoundException, UnauthorizedException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { UserProvider } from 'src/user/services/user.provider';
import { EntityManager } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { GetCountDto } from './dtos/GetCount.dto';


@Injectable()
export class NotificationService {

    public currUserID: number;
    public currUserName: string;

    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider) {
        this.currUserID = this.userProvider.getCurrentUser()?.userId;
        this.currUserName = this.userProvider.getCurrentUser()?.username;
    }

    // helper method which will be injected in other services;

    async createNotification(createdBy: number, receivedUserId: number, typeId: number, originId: number, targetId: number, content?: string) {

        let notification;
        if (createdBy != receivedUserId && targetId) {
            notification = new Notification();
            notification.createdBy = createdBy;
            notification.receivedUserId = receivedUserId;
            notification.typeId = typeId;
            notification.targetId = targetId;
            notification.actionId = originId;

            if (content)
                notification.content = content;

            notification = await this.entityManager.save(notification, Notification)
        }

        return notification;
    }

    async getNotifications(postsByPage: number = 10, page: number = 1) {


        // pagination of seeing the notification;
        // should contain the content, userId, username, post.media or comment.description , user.profileImg


        // here should be a query which gets the notifications with pagination 
        // and also takes userID, profileImg and username
        // order by created at

        // join with notificationType
        // join with the users to get their basic information, profileIMg turn itt to url 
        // join it with notification type

        // make a get call which doesnt need any guard just get the comment details

    }

    async unseenNotificationsCnt() {

        let resp = new GetCountDto();

        resp.counter = await this.entityManager.count(Notification, {
            where: {
                seen: false,
                receivedUserId: this.currUserID
            }
        });

        return resp;
    }
}
