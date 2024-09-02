import { Injectable } from "@nestjs/common";
import { UserProvider } from "src/user/services/user.provider";
import { EntityManager } from "typeorm";


@Injectable()
export class ExploreService {

    public UserID: number;
    constructor(private readonly entityManager: EntityManager, private readonly userProvider: UserProvider
    ) {
        this.UserID = this.userProvider.getCurrentUser()?.userId;
    }




    async exploreSearchBar(username: string, postsByPage: number = 10, page: number = 1) {


        let resp: any;

        let offset = (page - 1) * postsByPage;

        let feedPostsQuery = `
      
        LIMIT ${postsByPage}
        OFFSET ${offset};`

        let posts = await this.entityManager.query(feedPostsQuery);

        // let feedContainer = [];
        // for (let post of posts) {
        //     let postContainer = [];

        //     if (post?.postMedia)
        //         post.postMedia = SnapShareUtility.urlConverter(post.postMedia);

        //     if (post?.postProfileImg)
        //         post.postProfileImg = SnapShareUtility.urlConverter(post.postProfileImg);

        //     let comment = await this.commentService.getComments(post.postId, postCommentsLimit)

        //     postContainer.push(post, comment)
        //     feedContainer.push(postContainer);
        // }

        // resp = { feedContainer };
        return resp;
    }

}


