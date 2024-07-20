import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Post } from 'src/post/post.entity';
import { Story } from 'src/story/story.entity';

@Entity('storyLike')
export class StoryLike {
    @PrimaryGeneratedColumn({ name: 'likeId' })
    likeId: number;

    @Column({ name: 'userId', type: 'integer' })
    userId: number;

    @Column({ name: 'storyId', type: 'integer' })
    storyId: number;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
    updatedAt: Date;

    @Column({ name: 'deleted', default: false })
    deleted: boolean;

    @ManyToOne(() => User, user => user.stories, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
    user: User;

    @ManyToOne(() => Story, story => story.storyLikes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'storyId', referencedColumnName: 'storyId' })
    story: Story;
}