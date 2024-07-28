import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Post } from 'src/post/post.entity';
import { Comment } from 'src/comment/comment.entity';

@Entity('commentLike')
export class CommentLike {
    @PrimaryGeneratedColumn({ name: 'likeId' })
    likeId: number;

    @Column({ name: 'userId', type: 'integer' })
    userId: number;

    @Column({ name: 'commentId', type: 'integer' })
    commentId: number;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
    updatedAt: Date;

    @Column({ name: 'deleted', default: false })
    deleted: boolean;

    @ManyToOne(() => User, user => user.postLikes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
    user: User;

    @ManyToOne(() => Comment, comment => comment.commentLikes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'commentId', referencedColumnName: 'commentId' })
    comment: Comment;
}
