import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity('network')
export class Network {
    @PrimaryGeneratedColumn({ name: 'networkId' })
    networkId: number;

    @Column({ name: 'followerId', type: 'integer' })
    followerId: number;

    @Column({ name: 'followeeId', type: 'integer' })
    followeeId: number;

    @Column({ default: false })
    pending: boolean;

    @Column({ default: false })
    deleted: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    requestedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    createdAt: Date;

    @ManyToOne(() => User, user => user.follower)
    @JoinColumn({ name: 'followerId', referencedColumnName: 'userId' })
    follower: User;

    @ManyToOne(() => User, user => user.followee)
    @JoinColumn({ name: 'followeeId', referencedColumnName: 'userId' })
    followee: User;
}