import {
    Controller,
    Get,
    HttpStatus
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetCountDto } from './dtos/GetCount.dto';


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

}