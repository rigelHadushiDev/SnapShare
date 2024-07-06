import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Like } from 'src/like/like.entity';
import { Comment } from 'src/comment/comment.entity';

@Entity('post')
export class Post {
    @PrimaryGeneratedColumn({ type: 'integer', name: 'postId' })
    postId: number;

    @Column({ name: 'userId' })
    userId: string;

    @Column({ name: 'likesNr', type: 'integer', nullable: true, default: 0 })
    likesNr: number;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
    updatedAt: Date;

    @Column({ name: 'archived', default: false })
    archived: boolean;

    @Column({ name: 'postDescription', nullable: true })
    postDescription: string;

    @Column({ name: 'media', nullable: true })
    media: string;

    @Column({ name: 'commentsNr', nullable: true, default: 0 })
    commentsNr: number;
    //--------------------------------------------
    @OneToMany(() => Like, like => like.post, { cascade: true })
    likes: Like[];

    @OneToMany(() => Comment, comment => comment.post, { cascade: true })
    comments: Comment[];

    @ManyToOne(() => User, user => user.posts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
    user: User;
}
