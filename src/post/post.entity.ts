import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Like } from 'src/like/like.entity';
import { Comment } from 'src/comment/comment.entity';

@Entity('post')
export class Post {
    @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
    postId: number;

    @Column({ name: 'user_id', type: 'integer' })
    userId: number;

    @Column({ name: 'likes_nr', type: 'integer', nullable: true })
    likesNr: number;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @Column({ name: 'archived', default: false })
    archived: boolean;

    @Column({ name: 'deleted', default: false })
    deleted: boolean;

    @Column({ name: 'post_description', nullable: true })
    postDescription: string;

    @Column({ name: 'media', nullable: true })
    media: string;

    @Column({ name: 'comments_nr', nullable: true })
    commentsNr: number;

    @ManyToOne(() => User, user => user.posts)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
    user: User;

    @OneToMany(() => Like, like => like.post)
    likes: Like[];

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];
}
