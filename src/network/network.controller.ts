import { Controller, HttpCode, HttpStatus, NotFoundException, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NetworkService } from './network.service';
import { ApiException } from '@nanogiants/nestjs-swagger-api-exception-decorator';
import { GeneralResponse } from 'src/post/dtos/GeneralResponse';


@ApiBearerAuth()
@ApiTags('Network Module')
@Controller('network')
export class NetworkController {

    constructor(private readonly networkService: NetworkService) { }


    @Post('follow/:followeeId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Follow a user', description: 'Create a new connection.' })
    @ApiException(() => NotFoundException, { description: 'User with this Id not found.  [key: "userNotFound" ]' })
    @ApiParam({ name: 'followeeId', description: 'ID of the user that you want to follow' })
    @ApiResponse({ status: HttpStatus.OK, description: 'The user has been successfully followed.', type: GeneralResponse })
    async followUser(@Param() followeeId: number) {
        return await this.networkService.followUser(followeeId);
    }

    @Post('unfollow/:followeeId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Unfollow a user', description: 'Unfollow a new connection.' })
    @ApiException(() => NotFoundException, { description: 'User with this Id not found.  [key: "userNotFound" ]' })
    @ApiException(() => NotFoundException, { description: 'Cannot unfollow a user which is not part of your network.  [key: "networkConnectionNotFound" ]' })
    @ApiParam({ name: 'followeeId', description: 'ID of the user that you want to unfollow' })
    @ApiResponse({ status: HttpStatus.OK, description: 'The user has been successfully unfollowed.', type: GeneralResponse })
    async unfollowUser(@Param() followeeId: number) {
        return await this.networkService.followUser(followeeId);
    }


    @Post('remove/:followeeId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Follow a user', description: 'Remove a connection.' })
    @ApiException(() => NotFoundException, { description: 'User with this Id not found.  [key: "userNotFound" ]' })
    @ApiException(() => NotFoundException, { description: 'Cannot remove a user which is not part of your network.  [key: "cantRemoveNonFollowingUser" ]' })
    @ApiParam({ name: 'followeeId', description: 'ID of the friend that you want to remove' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Successfully removed a friend connection from your account. ', type: GeneralResponse })
    async removeConnection(@Param() followeeId: number) {
        return await this.networkService.removeConnection(followeeId);
    }




}
