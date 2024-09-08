import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Story } from './story.entity';

@Entity('storyViews')
export class StoryViews {

    @PrimaryGeneratedColumn({ type: 'integer', name: 'storyViewsId' })
    @ApiProperty({ description: 'The unique ID of the StoryViews record.' })
    storyViewsId: number;

    @ManyToOne(() => User, user => user.stories, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
    @ApiProperty({ description: 'The ID of the user who viewed the story.' })
    user: User;

    @ManyToOne(() => Story, story => story.storyViews, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'storyId', referencedColumnName: 'storyId' })
    @ApiProperty({ description: 'The ID of the story that was viewed by the user.' })
    story: Story;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
    @ApiProperty({ description: 'The date and time when the story was viewed.' })
    createdAt: Date;
}
