import { CanActivate, ExecutionContext, Injectable, ForbiddenException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Observable, from, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
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

        if (!user || !params) {
            throw new ForbiddenException('Unauthorized access');
        }

        const userId = user.userId;
        const postId = params.postId;

        return from(this.userService.getUserById(userId)).pipe(
            switchMap((user: User) =>
                from(this.postService.findPostById(postId)).pipe(
                    switchMap((post: Post) => {
                        if (!post) {
                            throw new NotFoundException('Post not found');
                        }
                        if (user.userId !== post.userId) {
                            throw new ForbiddenException('forbiddenResource');
                        }
                        return of(true);
                    })
                ),
            ),
        );
    }
}
