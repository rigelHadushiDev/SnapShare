import { User } from 'src/user/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn
} from 'typeorm';
import { NotificationType } from './notificationType.entity';

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

    @Column({ name: 'seen', type: 'boolean', default: false })
    seen: boolean;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
    createdAt: Date;

    @Column({ name: 'originId', type: 'integer', nullable: true })
    originId: number;

    @Column({ name: 'targetId', type: 'integer', nullable: true })
    targetId: number;

    @Column({ name: 'content', type: 'varchar', nullable: true })
    content: string;

    @ManyToOne(() => User, user => user.receivedNotifications, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'receivedUserId', referencedColumnName: 'userId' })
    receivedUser: User;

    @ManyToOne(() => User, user => user.createdNotifications, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'createdBy', referencedColumnName: 'userId' })
    createdUser: User;

    @ManyToOne(() => NotificationType, notification => notification.typeId, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'typeId', referencedColumnName: 'notificationTypeId' })
    receivedNotifications: NotificationType;

}