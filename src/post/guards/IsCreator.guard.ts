import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Post } from 'src/post/post.entity';
import { PostService } from 'src/post/post.service';
import { User } from 'src/user/user.entity';
import { UsersService } from 'src/user/users.service';

@Injectable()
export class IsCreatorGuard implements CanActivate {
    constructor(
        private userService: UsersService,
        private postService: PostService,
    ) { }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const { user, params }: { user: User; params: { postId: number } } = request;

        if (!user || !params) return false;

        const userId = user.userId;
        const postId = params.postId;

        return from(this.userService.getUserById(userId)).pipe(
            switchMap((user: User) =>
                from(this.postService.findPostById(postId)).pipe(
                    map((post: Post) => {
                        let isAuthor = user.userId === post.userId;
                        return isAuthor;
                    }),
                    catchError(error => {
                        console.error('Error:', error);
                        return of(false);
                    })
                ),
            ),
        );
    }
}
