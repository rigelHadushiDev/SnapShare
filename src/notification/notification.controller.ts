import {
    Controller,
    Get,
    HttpStatus,
    Query
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetCountDto } from './dtos/GetCount.dto';
import { PaginationDto } from 'src/user/dtos/GetUserPosts.dto';
import { GetNotificationResDto } from './dtos/GetNotificationsRes.dto';

@ApiBearerAuth()
@ApiTags("Notifications APIs")
@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get('unseenNotificationsCnt')
    @ApiOperation({ summary: 'Get the count of the unseen notifications.', description: 'Counter of the unseen notifications by the user' })
    @ApiResponse({ status: HttpStatus.OK, description: 'The current loged-in user has this many unseen notifications.', type: GetCountDto })
    async unseenNotificationsCnt() {
        return await this.notificationService.unseenNotificationsCnt();
    }

    @Get('getNotifications')
    @ApiOperation({ summary: 'Get all notifications of the user.' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully retrived user notifications.', type: GetNotificationResDto })
    async getNotifications(@Query() query: PaginationDto) {
        const { postsByPage, page } = query;
        return await this.notificationService.getNotifications(postsByPage, page);
    }

}