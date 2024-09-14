import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity('UserFeed')
export class UserFeed {
    @PrimaryGeneratedColumn({ type: 'integer' })
    userId: number;

    @Column({ type: 'timestamp' })
    lastSeenTimestamp: Date;

    @OneToOne(() => User, user => user.userFeed, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}