import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { Post } from 'src/post/post.entity';
import { User } from 'src/user/user.entity';

@Entity('comment')
export class Comment {
    @PrimaryGeneratedColumn({ name: 'commentId', type: "integer" })
    commentId: number;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
    updatedAt: Date;

    @Column({ name: 'commentDescription', type: "text" })
    commentDescription: string;

    @Column({ name: 'postId', type: "integer" })
    postId: number;

    @Column({ name: 'userId', type: "integer" })
    userId: number;

    @Column({ name: 'likeNr', type: "integer", default: 0 })
    likeNr: number;

    @Column({ name: 'parentCommentId', type: "integer", default: null })
    parentCommentId: number;

    @ManyToOne(() => Post, post => post.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'postId', referencedColumnName: 'postId' })
    post: Post;

    @ManyToOne(() => User, user => user.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
    user: User;
}