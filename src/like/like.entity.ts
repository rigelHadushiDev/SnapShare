import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Post } from 'src/post/post.entity';

@Entity('like')
export class Like {
    @PrimaryGeneratedColumn({ name: 'id' })
    likeId: number;

    @Column({ name: 'user_id', type: 'integer' })
    userId: number;

    @Column({ name: 'post_id', type: 'integer' })
    postId: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
    user: User;

    @ManyToOne(() => Post)
    @JoinColumn({ name: 'postId', referencedColumnName: 'postId' })
    post: Post;
}