import { ApiProperty } from "@nestjs/swagger";

export class GetNotificationResDto {

    @ApiProperty({
        example: 25,
        description: 'Unique identifier of the notification.'
    })
    notificationId: number;

    @ApiProperty({
        example: 2,
        description: 'User ID of the person who received the notification.'
    })
    receivedUserId: number;

    @ApiProperty({
        example: 8,
        description: 'Type ID of the notification (e.g., comment, like, follow).'
    })
    typeId: number;

    @ApiProperty({
        example: 5,
        description: 'User ID of the person who created the notification.'
    })
    createdBy: number;

    @ApiProperty({
        example: '2024-10-10T18:53:59.161Z',
        description: 'Timestamp when the notification was created (ISO format).'
    })
    createdAt: string;

    @ApiProperty({
        example: false,
        description: 'Indicates whether the notification has been seen by the user.'
    })
    seen: boolean;

    @ApiProperty({
        example: 42,
        description: 'Origin ID related to the notification (e.g., comment ID, post ID).'
    })
    originId: number;

    @ApiProperty({
        example: 22,
        description: 'Target ID related to the notification (e.g., target post, user, or comment).'
    })
    targetId: number;

    @ApiProperty({
        example: 'New comment reply',
        description: 'Content of the notification (e.g., description of the event).'
    })
    content: string;

    @ApiProperty({
        example: 'https://example.com/path/to/profileImg.jpg',
        description: 'URL or file path to the profile image of the user who received the notification.',
        nullable: true
    })
    receivedUserProfile: string | null;

    @ApiProperty({
        example: null,
        description: 'URL or file path to the profile image of the user who created the notification (nullable).',
        nullable: true
    })
    createdByUserProfile: string | null;

    @ApiProperty({
        example: 'user123',
        description: 'Username of the user who received the notification.'
    })
    receivedUserUsername: string;

    @ApiProperty({
        example: 'user456',
        description: 'Username of the user who created the notification.'
    })
    createdByUserUsername: string;

    @ApiProperty({
        example: 8,
        description: 'Notification type identifier.'
    })
    notificationTypeId: number;

    @ApiProperty({
        example: 'commentReply',
        description: 'Notification key representing the type of action (e.g., commentReply, postLike).'
    })
    notificationKey: string;

    @ApiProperty({
        example: 'A user replied in your comment.',
        description: 'Description of the notification action.'
    })
    description: string;

    @ApiProperty({
        example: 'comment',
        description: 'The type of the origin entity (e.g., post, comment, user).'
    })
    originType: string;

    @ApiProperty({
        example: 'comment',
        description: 'The type of the target entity (e.g., post, comment, user).'
    })
    targetType: string;
}
