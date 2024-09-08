import { ApiException } from "@nanogiants/nestjs-swagger-api-exception-decorator";
import { Controller, Get, HttpStatus, NotFoundException, Param, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PaginationDto } from "src/user/dtos/GetUserPosts.dto";
import { ExploreService } from "./explore.service";
import { ExploreSearchBarDto } from "./exploreSearchBar.dto";

@ApiBearerAuth()
@ApiTags("User Feed APIs")
@Controller('explore')
export class ExploreController {

    constructor(private readonly exploreService: ExploreService) { }


    @Get('searchBar/:username')
    @ApiOperation({ summary: 'Search bar to explore SnapShare accounts. ' })
    @ApiParam({ name: 'username', required: true, description: 'Username of a Snap Share accounts.', type: String })
    @ApiResponse({ status: HttpStatus.OK, description: " Snap Share user accounts that match that username are retrived successfully.", type: [ExploreSearchBarDto] })
    exploreSearchBar(@Param('username') username: string, @Query() query: PaginationDto,) {
        const { postsByPage, page } = query;
        return this.exploreService.exploreSearchBar(username, postsByPage, page);
    }


}