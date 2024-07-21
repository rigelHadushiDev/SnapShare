import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LikeService } from './like.service';

@ApiTags('Like APIs')
@ApiBearerAuth()
@Controller('like')
export class LikeController {

    constructor(private readonly likeService: LikeService) {

    }
    // shto guard dhe dokumnetimin e throw error
    // togglePost


    // shto guard dhe dokumnetimin e throw error
    // toggleStory


    // shto guard dhe dokumnetimin e throw error
    // toggleComment

    // shto guard e nqs eshte 
    // view Story Liked

    // shto guard dhe dokumnetimin e throw error
    // view Post Liked

    // also add the PostAccessGuard dhe storyAcessGuard ne network dhe hiqi ato individual queries rregullo dokumentacionin

}
