import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { Post } from 'src/post/post.entity';
import { User } from 'src/user/user.entity';

@Entity('comment')
export class Comment {
    @PrimaryGeneratedColumn({ name: 'id', type: "integer" })
    id: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @Column({ name: 'comment_description', type: "text" })
    commentDescription: string;

    @Column({ name: 'post_id', type: "integer" })
    postId: number;

    @Column({ name: 'user_id', type: "integer" })
    userId: number;

    @ManyToOne(() => Post, post => post.comments)
    @JoinColumn({ name: 'post_id', referencedColumnName: 'postId' })
    post: Post;

    @ManyToOne(() => User, user => user.comments)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
    user: User;
}