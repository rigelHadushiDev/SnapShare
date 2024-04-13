import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity('network')
export class Network {
    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column({ name: 'follower_id', type: 'integer' })
    followerID: number;

    @Column({ name: 'followee_id', type: 'integer' })
    followeeID: number;

    @Column({ type: 'enum', enum: ['pending', 'accepted'], default: 'pending' })
    status: string;

    @ManyToOne(() => User, user => user.follower)
    @JoinColumn({ name: 'follower_id', referencedColumnName: 'userId' })
    follower: User;

    @ManyToOne(() => User, user => user.followee)
    @JoinColumn({ name: 'followee_id', referencedColumnName: 'userId' })
    followee: User;
}