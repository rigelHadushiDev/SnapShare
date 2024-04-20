import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity('network')
export class Network {
    @PrimaryGeneratedColumn({ name: 'networkId' })
    networkId: number;

    @Column({ name: 'followerID', type: 'integer' })
    followerID: number;

    @Column({ name: 'followeeID', type: 'integer' })
    followeeID: number;

    @Column({ type: 'enum', enum: ['pending', 'accepted'], default: 'pending' })
    status: string;

    @ManyToOne(() => User, user => user.follower)
    @JoinColumn({ name: 'follower', referencedColumnName: 'userId' })
    follower: User;

    @ManyToOne(() => User, user => user.followee)
    @JoinColumn({ name: 'followee', referencedColumnName: 'userId' })
    followee: User;
}