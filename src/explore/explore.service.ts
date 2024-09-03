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

        const directConnectionWeight = 0.50;
        const friendsConnectionWeight = 0.30;

        const directLimit = Math.floor(postsByPage * directConnectionWeight);
        const friendLimit = Math.floor(postsByPage * friendsConnectionWeight);
        const othersLimit = postsByPage - (directLimit + friendLimit);

        let directOffset = (page - 1) * directLimit;
        let friendOffset = (page - 1) * friendLimit;
        let othersOffset = (page - 1) * othersLimit;

        let directNetworkList = await this.entityManager.query(`SELECT 
        u."userId",
        u.username,
        u."firstName",
        u."lastName",
        u."profileImg",
        'direct' AS "connectionType",
        NULL::bigint AS "followerCount"
    FROM 
        "user" u
    JOIN 
        network n ON u."userId" = n."followeeId" OR u."userId" = n."followerId"
    WHERE 
        (n."followerId" = ${this.UserID} OR n."followeeId" = ${this.UserID})
        AND n.deleted = FALSE
        AND u.archive = FALSE
        AND u."userId" != ${this.UserID}
    LIMIT ${directLimit}
    OFFSET ${directOffset};`);

        let friendsNetworkList = await this.entityManager.query(`SELECT 
        u."userId",
        u.username,
        u."firstName",
        u."lastName",
        u."profileImg",
        'friend' AS "connectionType",
        NULL::bigint AS "followerCount"
    FROM 
        "user" u
    JOIN 
        network n1 ON u."userId" = n1."followeeId"
    JOIN 
        network n2 ON n1."followerId" = n2."followeeId"
    WHERE 
        n2."followerId" = ${this.UserID}
        AND u."userId" != ${this.UserID}
        AND n2.deleted = FALSE
        AND u.archive = FALSE
        AND u."userId" NOT IN (
            SELECT u2."userId"
            FROM "user" u2
            JOIN network n3 ON u2."userId" = n3."followeeId" OR u2."userId" = n3."followerId"
            WHERE 
                (n3."followerId" = ${this.UserID} OR n3."followeeId" = ${this.UserID})
                AND n3.deleted = FALSE
                AND u2.archive = FALSE
        )
    LIMIT ${directLimit}
    OFFSET ${directOffset};`);

        let popularityList = await this.entityManager.query(` SELECT
    u."userId",
    u.username,
    u."firstName",
    u."lastName",
    u."profileImg",
    'others' AS "connectionType",
    COUNT(n."followerId") AS "followerCount"
        FROM
        "user" u
    LEFT JOIN 
        network n ON u."userId" = n."followeeId"
        WHERE
        n.deleted = FALSE
        AND u.archive = FALSE
        AND u."userId" NOT IN(
            SELECT "userId"
            FROM(
                SELECT u."userId"
                FROM "user" u
                JOIN network n1 ON u."userId" = n1."followeeId" OR u."userId" = n1."followerId"
                WHERE
                    (n1."followerId" = ${this.UserID} OR n1."followeeId" = ${this.UserID})
                    AND n1.deleted = FALSE
                    AND u.archive = FALSE
                UNION
                SELECT u."userId"
                FROM "user" u
                JOIN network n2 ON u."userId" = n2."followeeId"
                JOIN network n3 ON n2."followerId" = n3."followeeId"
                WHERE 
                    n3."followerId" = ${this.UserID}
                    AND n2.deleted = FALSE
                    AND u.archive = FALSE
            ) AS filtered_users
        )
    GROUP BY
        u."userId", u.username, u."firstName", u."lastName", u."profileImg"
    ORDER BY
        "followerCount" DESC
       LIMIT ${othersLimit}
    OFFSET ${othersOffset};`);


        // now do a loop based so you can extract their userId in a string with , and also convert the profileImg in url


        // after you take them make a query that calculates their likes nr and comments nr with you and order each of them in their catgory 
        // they should be grouped by their catgory  and ordered by in their engagment with you like, comments 
        // do one query that does this for all of them and then use code




















        // let usersContainer = [];
        // for (let user of users) {
        //  

        //     if (user?.profileImg)
        //         user?.profileImg = SnapShareUtility.urlConverter(user?.profileImg);

        //     usersContainer.push(post, comment)

        // }

        // resp =  usersContainer ;
        return resp;
    }

}


