import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity('UserFeed')
export class UserFeed {
    @PrimaryColumn({ type: 'integer' })
    userId: number;

    @Column({ type: 'timestamp' })
    lastSeenTimestamp: Date;

    @OneToOne(() => User, user => user.userFeed, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;
}