import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from 'src/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { StoryLike } from 'src/like/entities/StoryLike.entity';
import { StoryViews } from './StoryViews.entity';


@Entity('story')
export class Story {

    @PrimaryGeneratedColumn({ type: 'integer', name: 'storyId' })
    @ApiProperty({ description: 'The unique ID of the story.' })
    storyId: number;

    @Column({ name: 'userId' })
    @ApiProperty({ description: 'The ID of the user who created the story.' })
    userId: number;

    @Column({ name: 'likesNr', type: 'integer', nullable: true, default: 0 })
    @ApiProperty({ description: 'The number of likes the story has.', nullable: true })
    likesNr: number;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
    @ApiProperty({ description: 'The date and time when the story was created.' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
    @ApiProperty({ description: 'The date and time when the story was last updated.' })
    updatedAt: Date;

    @Column({ name: 'archive', type: 'boolean', default: false })
    @ApiProperty({ description: 'The archieve which is set after 24h the story is created' })
    archive: boolean;

    @Column({ name: 'media', nullable: true })
    @ApiProperty({ description: 'The media content associated with the post (e.g., image URL).', nullable: true })
    media: string;

    @OneToMany(() => StoryLike, storyLike => storyLike.story)
    storyLikes: StoryLike[];

    @ManyToOne(() => User, user => user.stories, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
    user: User;

    @OneToMany(() => StoryViews, storyViews => storyViews.story)
    storyViews: StoryViews[];
}