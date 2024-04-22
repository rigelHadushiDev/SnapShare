import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Like } from 'src/like/like.entity';
import { Comment } from 'src/comment/comment.entity';

@Entity('post')
export class Post {
    @PrimaryGeneratedColumn({ type: 'integer', name: 'postId' })
    postId: number;

    @Column({ name: 'userId', type: 'integer' })
    userId: number;

    @Column({ name: 'likesNr', type: 'integer', nullable: true })
    likesNr: number;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
    updatedAt: Date;

    @Column({ name: 'archived', default: false })
    archived: boolean;

    @Column({ name: 'deleted', default: false })
    deleted: boolean;

    @Column({ name: 'postDescription', nullable: true })
    postDescription: string;

    @Column({ name: 'media', nullable: true })
    media: string;

    @Column({ name: 'commentsNr', nullable: true })
    commentsNr: number;

    @OneToMany(() => Like, like => like.post)
    likes: Like[];

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];

    @ManyToOne(() => User, user => user.posts)
    @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
    user: User;
}
