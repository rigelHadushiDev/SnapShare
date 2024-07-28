import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from 'src/user/user.entity';
import { PostLike } from 'src/like/postLike.entity';
import { Comment } from 'src/comment/comment.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('post')
export class Post {
    @PrimaryGeneratedColumn({ type: 'integer', name: 'postId' })
    @ApiProperty({ description: 'The unique ID of the post.' })
    postId: number;

    @Column({ name: 'userId' })
    @ApiProperty({ description: 'The ID of the user who created the post.' })
    userId: number;

    @Column({ name: 'likesNr', type: 'integer', nullable: true, default: 0 })
    @ApiProperty({ description: 'The number of likes the post has.', nullable: true })
    likesNr: number;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
    @ApiProperty({ description: 'The date and time when the post was created.' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
    @ApiProperty({ description: 'The date and time when the post was last updated.' })
    updatedAt: Date;

    @Column({ name: 'archive', default: false })
    @ApiProperty({ description: 'Indicates whether the post is archived.', default: false })
    archive: boolean;

    @Column({ name: 'postDescription', nullable: true })
    @ApiProperty({ description: 'The description or content of the post.', nullable: true })
    postDescription: string;

    @Column({ name: 'media', nullable: true })
    @ApiProperty({ description: 'The media content associated with the post (e.g., image URL).', nullable: true })
    media: string;

    @Column({ name: 'commentsNr', nullable: true, default: 0 })
    @ApiProperty({ description: 'The number of comments the post has.', nullable: true })
    commentsNr: number;

    @OneToMany(() => PostLike, postLike => postLike.post)
    postLikes: PostLike[];

    @OneToMany(() => Comment, comment => comment.post)
    comments: Comment[];

    @ManyToOne(() => User, user => user.posts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
    user: User;
}
