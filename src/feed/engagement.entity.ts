import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from 'src/user/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('engagement')
export class Engagement {
    @PrimaryGeneratedColumn({ type: 'integer', name: 'postId' })
    @ApiProperty({ description: 'The unique ID of the post.' })
    engagementId: number;

    @Column({ name: 'userId1' })
    @ApiProperty({ description: 'The ID of the first user involved in the engagement.' })
    userId1: number;

    @Column({ name: 'userId2' })
    @ApiProperty({ description: 'The ID of the second user involved in the engagement.' })
    userId2: number;

    @Column({ name: 'engagementNr', type: 'integer', nullable: true, default: 0 })
    @ApiProperty({ description: 'The number of engagements the users have with each other.', nullable: true })
    engagementNr: number;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
    @ApiProperty({ description: 'The date and time when the engagment started was created.' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
    @ApiProperty({ description: 'The date and time when the engagment was last updated.' })
    updatedAt: Date;

    @ManyToOne(() => User, user => user.initiatedEngagements, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId1', referencedColumnName: 'userId' })
    user1: User;

    @ManyToOne(() => User, user => user.receivedEngagements, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId2', referencedColumnName: 'userId' })
    user2: User;
}
