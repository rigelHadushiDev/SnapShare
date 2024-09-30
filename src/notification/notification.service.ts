import { Injectable, NotFoundException, UnauthorizedException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { UserProvider } from 'src/user/services/user.provider';
import { EntityManager } from 'typeorm';
import { Notification } from './entities/notification.entity';


@Injectable()
export class NotificationService {

    public currUserID: number;
    public currUserName: string;

    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider) {
        this.currUserID = this.userProvider.getCurrentUser()?.userId;
        this.currUserName = this.userProvider.getCurrentUser()?.username;
    }

    // helper method which will be injected in other services;

    async createNotification(createdBy: number, receivedUserId: number, typeId: number, contentId: number) {

        let notification;
        if (createdBy != receivedUserId) {
            notification = await this.entityManager
                .createQueryBuilder()
                .insert()
                .into(Notification)
                .values({
                    createdBy: createdBy,
                    receivedUserId: receivedUserId,
                    typeId: typeId,
                    contentId: contentId
                })
                .execute();
        }

        return notification;
    }

    async getNotifications(postsByPage: number = 10, page: number = 1) {


        // pagination of seeing the notification;
        // should contain the content, userId, username, post.media or comment.description , user.profileImg


        // here should be a query which gets the notifications with pagination 
        // and also takes userID, profileImg and username
        // order by created at

        // at the ned of the api the notifications that were retrived by the query should be set seen to true

        // a switch  1  postId and postmedia and postdescription 
        // a switch  2  storyId and storymedia and storydescription 
        // switch  7 8  comment description 

    }

    async unseenNotificationsCnt() {


        // simple the count of the notifications that arent seen by the user 
        // notification.seen = FALSE where notification."recievedUserId" = ${this.currUserID}

    }


}
