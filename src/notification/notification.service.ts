import { Injectable, NotFoundException, UnauthorizedException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { UserProvider } from 'src/user/services/user.provider';
import { EntityManager } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { GetCountDto } from './dtos/GetCount.dto';
import { GetNotificationResDto } from './dtos/GetNotificationsRes.dto';
import { SnapShareUtility } from 'src/common/utilities/snapShareUtility.utils';


@Injectable()
export class NotificationService {

    public currUserID: number;
    public currUserName: string;

    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider) {
        this.currUserID = this.userProvider.getCurrentUser()?.userId;
        this.currUserName = this.userProvider.getCurrentUser()?.username;
    }

    async createNotification(createdBy: number, receivedUserId: number, typeId: number, originId: number, targetId: number, content?: string) {

        let notification;
        if (createdBy != receivedUserId && targetId) {
            notification = new Notification();
            notification.createdBy = createdBy;
            notification.receivedUserId = receivedUserId;
            notification.typeId = typeId;
            notification.targetId = targetId;
            notification.originId = originId;

            if (content)
                notification.content = content;

            notification = await this.entityManager.save(notification, Notification)
        }

        return notification;
    }

    async getNotifications(postsByPage: number = 10, page: number = 1) {

        let resp: GetNotificationResDto[] = [];

        let skip: number = (page - 1) * postsByPage;

        let userNotificationsQuery = `        
        SELECT 
            n.*,
            u1."profileImg" AS "receivedUserProfile",
            u2."profileImg" AS "createdByUserProfile",
            u1."username" AS "receivedUserUsername",
            u2."username" AS "createdByUserUsername",
            nt.*
        FROM 
            notification n
        INNER JOIN "user" u1 ON n."receivedUserId" = u1."userId"
        INNER JOIN "user" u2 ON n."createdBy" = u2."userId"
        Inner JOIN "notificationType" nt ON n."typeId" = nt."notificationTypeId"
        Where n."receivedUserId" = $1
        LIMIT $2 OFFSET $3; `

        resp = await this.entityManager.query(userNotificationsQuery, [this.currUserID, postsByPage, skip])

        if (resp?.length > 0) {

            const notificationsIds: number[] = resp.map((notification: any) => notification.notificationId);

            for (let notification of resp) {

                if (notification?.receivedUserProfile)
                    notification.receivedUserProfile = SnapShareUtility.urlConverter(notification.receivedUserProfile);

                if (notification?.createdByUserProfile)
                    notification.createdByUserProfile = SnapShareUtility.urlConverter(notification.createdByUserProfile);
            }

            await this.entityManager
                .createQueryBuilder()
                .update(Notification)
                .set({ seen: true })
                .where('notificationId IN (:...ids)', { ids: notificationsIds })
                .execute();

        }
        return resp;

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
