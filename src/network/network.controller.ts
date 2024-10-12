import { BadRequestException, Controller, ForbiddenException, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NetworkService } from './network.service';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { GeneralResponse } from 'src/post/dtos/GeneralResponse';
import { GetUserStatsRes } from './responses/getUserStatsRes';
import { PaginationDto } from 'src/user/dtos/GetUserPosts.dto';
import { UserListRes } from './responses/UserListRes';


@ApiBearerAuth()
@ApiTags('Network Module')
@Controller('network')
export class NetworkController {

    constructor(private readonly networkService: NetworkService) { }


    @Post('follow/:followeeId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Follow a user', description: 'Create a new connection.' })
    @ApiException(() => NotFoundException, { description: 'User with this Id not found.  [key: "userNotFound" ]' })
    @ApiException(() => BadRequestException, { description: 'The user already Follows this account.  [key: "followRequestAlreadySent" ]' })
    @ApiParam({ name: 'followeeId', description: 'ID of the user that you want to follow' })
    @ApiResponse({ status: HttpStatus.OK, description: 'The user has been successfully followed.', type: GeneralResponse })
    async followUser(@Param('followeeId') followeeId: number) {
        return await this.networkService.followUser(followeeId);
    }


    @Post('unfollow/:followeeId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Unfollow a user', description: 'Unfollow a new connection.' })
    @ApiException(() => NotFoundException, { description: 'User with this Id not found.  [key: "userNotFound" ]' })
    @ApiException(() => NotFoundException, { description: 'Cannot unfollow a user which is not part of your network.  [key: "networkConnectionNotFound" ]' })
    @ApiParam({ name: 'followeeId', description: 'ID of the user that you want to unfollow' })
    @ApiResponse({ status: HttpStatus.OK, description: 'The user has been successfully unfollowed.', type: GeneralResponse })
    async unfollowUser(@Param('followeeId') followeeId: number) {
        return await this.networkService.unfollowUser(followeeId);
    }


    @Post('remove/:userId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Follow a user', description: 'Remove a connection.' })
    @ApiException(() => NotFoundException, { description: 'User with this Id not found.  [key: "userNotFound" ]' })
    @ApiException(() => NotFoundException, { description: 'Cannot remove a user which is not part of your network.  [key: "cantRemoveNonFollowingUser" ]' })
    @ApiParam({ name: 'userId', description: 'ID of the friend that you want to remove' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully removed a friend connection from your account. ', type: GeneralResponse })
    async removeConnection(@Param('userId') userId: number) {
        return await this.networkService.removeConnection(userId);
    }


    @Get('getUserStats/:followeeId')
    @ApiOperation({ summary: 'Get users stats such as followers, following and post counts.' })
    @ApiException(() => NotFoundException, { description: 'User with this Id not found.  [key: "userNotFound" ]' })
    @ApiParam({ name: 'followeeId', description: 'ID of the friend that you want to get their followers and following Count' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully retrieved sers stats such as followers, following and post counts.', type: GetUserStatsRes })
    async getUserStats(@Param('followeeId') followeeId: number) {
        return await this.networkService.getUserStats(followeeId);
    }


    @Post('handleFollowRequest/:senderId/:inviteAction')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Handle Follow requests from a private account' })
    @ApiException(() => NotFoundException, { description: 'User with this Id not found.  [key: "userNotFound" ]' })
    @ApiException(() => NotFoundException, { description: 'The follow Request was not found.  [key: "followRequestNotFound" ]' })
    @ApiParam({ name: 'senderId', description: 'ID of the user taht send you a friend request' })
    @ApiParam({ name: 'inviteAction', description: '' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully removed/accepted a friend connection from your account. ', type: GeneralResponse })
    async handleFollowRequest(@Param('senderId') senderId: number, @Param('inviteAction') inviteAction: boolean) {
        return await this.networkService.handleFollowRequest(senderId, inviteAction);
    }


    @Get('getFollowersList/:userId')
    @ApiParam({ name: 'userId', description: 'Id of the user you want to see the folloers List' })
    @ApiException(() => NotFoundException, { description: 'User with this Id not found.  [key: "userNotFound" ]' })
    @ApiException(() => ForbiddenException, { description: 'You are not a follower of this private user account.  [key: "nonFriendPrivateAccList" ]' })
    @ApiResponse({ type: UserListRes, status: HttpStatus.OK, description: 'Successfully retrieved users followers list ' })
    async getFollowersList(@Param('userId') userId: number, @Query() query: PaginationDto) {
        const { postsByPage, page } = query;
        return await this.networkService.getFollowersList(userId, postsByPage, page);
    }

    @Get('getFollowersList/:userId')
    @ApiParam({ name: 'userId', description: 'Id of the user you want to see the folloers List' })
    @ApiException(() => NotFoundException, { description: 'User with this Id not found.  [key: "userNotFound" ]' })
    @ApiException(() => ForbiddenException, { description: 'You are not a follower of this private user account.  [key: "nonFriendPrivateAccList" ]' })
    @ApiResponse({ type: UserListRes, status: HttpStatus.OK, description: 'Successfully retrieved users followers list ' })
    async getFolloweringList(@Param('userId') userId: number, @Query() query: PaginationDto) {
        const { postsByPage, page } = query;
        return await this.networkService.getFollowingList(userId, postsByPage, page);
    }
}
