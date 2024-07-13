import { User } from 'src/user/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    ManyToMany,
} from 'typeorm';

@Entity('notification')
export class Notification {

    @PrimaryGeneratedColumn({ name: 'notificationId' })
    notificationId: number;

    @Column({ name: 'receivedUserId', type: 'integer' })
    receivedUserId: number;

    @Column({ name: 'typeId', type: 'integer' })
    typeId: number;

    @Column({ name: 'createdBy', type: 'integer' })
    createdBy: number;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
    createdAt: Date;

    @ManyToOne(() => User, user => user.receivedNotifications, { nullable: true })
    @JoinColumn({ name: 'receivedUserId', referencedColumnName: 'userId' })
    receivedUser: User;

    @ManyToOne(() => User, user => user.createdNotifications, { nullable: true })
    @JoinColumn({ name: 'createdBy', referencedColumnName: 'userId' })
    createdUser: User;

    @ManyToMany(() => Notification, notification => notification.typeId, { cascade: true })
    receivedNotifications: Notification[];
}