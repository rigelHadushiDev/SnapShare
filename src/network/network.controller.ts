import { BadRequestException, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NetworkService } from './network.service';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { GeneralResponse } from 'src/post/dtos/GeneralResponse';
import { ConnectionsCntRes } from './connectionsCntRes';
import { GetUserPostsReq } from 'src/user/dtos/GetUserPosts.dto';


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


    @Get('connectionCnt/:followeeId')
    @ApiOperation({ summary: 'Get users count of followers and following accounts' })
    @ApiException(() => NotFoundException, { description: 'User with this Id not found.  [key: "userNotFound" ]' })
    @ApiParam({ name: 'followeeId', description: 'ID of the friend that you want to get their followers and following Count' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully retrieved the followers and following count', type: ConnectionsCntRes })
    async connectionCount(@Param('followeeId') followeeId: number) {
        return await this.networkService.connectionCount(followeeId);
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

    // ndryshoji emrin dto qe te jete me e pergjithsme si psh PaginationQueryParam
    @Get('getFollowersList/:userId')
    async getFollowersList(@Param('userId') userId: number, @Query() query: GetUserPostsReq) {
        const { postsByPage, page } = query;
        return await this.networkService.getFollowersList(userId, postsByPage, page);
    }
}
