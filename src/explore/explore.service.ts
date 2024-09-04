import { Injectable } from "@nestjs/common";
import { SnapShareUtility } from "src/common/utilities/snapShareUtility.utils";
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

        const directConnectionWeight = 0.50;
        const friendsConnectionWeight = 0.30;

        let directLimit = Math.floor(postsByPage * directConnectionWeight);
        let friendLimit = Math.floor(postsByPage * friendsConnectionWeight);
        let othersLimit = postsByPage - (directLimit + friendLimit);

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
                AND u.username ILIKE '${username}%'
                AND u."userId" != ${this.UserID}
            LIMIT ${directLimit}
            OFFSET ${directOffset};`);


        let sql = `WITH YourFriends AS (
            SELECT DISTINCT
                COALESCE(n."followerId", n."followeeId") AS friendId
            FROM network n
            WHERE 
                (n."followerId" = ${this.UserID} OR n."followeeId" = ${this.UserID})
                AND n.deleted = FALSE
        ),
        FriendsOfFriends AS (
            SELECT DISTINCT
                COALESCE(n2."followerId", n2."followeeId") AS fofId
            FROM network n1
            JOIN network n2 ON (n1."followerId" = n2."followeeId" OR n1."followeeId" = n2."followerId")
            WHERE 
                COALESCE(n1."followerId", n1."followeeId") IN (SELECT friendId FROM YourFriends)
                AND n2.deleted = FALSE
                AND COALESCE(n2."followerId", n2."followeeId") != ${this.UserID} 
        ),
        FriendsOfFriendsNotDirectlyConnected AS (
            SELECT DISTINCT
                fofId
            FROM FriendsOfFriends
            WHERE fofId NOT IN (SELECT friendId FROM YourFriends)
        )
        SELECT
            u."userId",
            u.username,
            u."firstName",
            u."lastName",
            u."profileImg",
            'friend' AS "connectionType",
            NULL::bigint AS "followerCount"
        FROM 
            "user" u
        JOIN FriendsOfFriendsNotDirectlyConnected fof
            ON u."userId" = fof.fofId
        WHERE
            u.archive = FALSE 
            AND u.username ILIKE '${username}%'
        ORDER BY
            u.username
        LIMIT ${friendLimit}
        OFFSET ${friendOffset};`

        let friendsNetworkList = await this.entityManager.query(sql);

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
        AND u.username ILIKE '${username}%'
        AND u."userId" NOT IN(
            SELECT "userId"
            FROM(
                SELECT u."userId"
                FROM "user" u
                JOIN network n1 ON u."userId" = n1."followeeId" OR u."userId" = n1."followerId"
                WHERE
                    (n1."followerId" = ${this.UserID} OR n1."followeeId" = ${this.UserID})
                    AND u.username ILIKE '${username}%'
                    AND n1.deleted = FALSE
                    AND u.archive = FALSE
                UNION
                SELECT u."userId"
                FROM "user" u
                JOIN network n2 ON u."userId" = n2."followeeId"
                JOIN network n3 ON n2."followerId" = n3."followeeId"
                WHERE 
                    n3."followerId" = ${this.UserID}
                    AND u.username ILIKE '${username}%'
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

        let users = [...directNetworkList, ...friendsNetworkList, ...popularityList];
        let usersContainer = [];
        for (let user of users) {

            if (user?.profileImg)
                user.profileImg = SnapShareUtility.urlConverter(user?.profileImg);

            usersContainer.push(user);

        }

        resp = usersContainer;
        return resp;
    }

}


