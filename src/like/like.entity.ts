import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Post } from 'src/post/post.entity';

@Entity('like')
export class Like {
    @PrimaryGeneratedColumn({ name: 'likeId' })
    likeId: number;

    @Column({ name: 'userId', type: 'integer' })
    userId: number;

    @Column({ name: 'postId', type: 'integer' })
    postId: number;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
    updatedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
    user: User;

    @ManyToOne(() => Post)
    @JoinColumn({ name: 'postId', referencedColumnName: 'postId' })
    post: Post;
}