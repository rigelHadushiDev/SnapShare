import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { Notification } from './notification.entity';

@Entity('notificationType')
export class NotificationType {

    @PrimaryGeneratedColumn({ name: 'notificationTypeId' })
    notificationTypeId: number;

    @Column({ name: 'notificationKey', type: 'varchar', nullable: false })
    notificationKey: string;

    @Column({ name: 'description', type: 'varchar', nullable: true })
    description: string;

    @ManyToMany(() => Notification, notification => notification.receivedNotifications, { nullable: true })
    @JoinColumn({ name: 'notificationTypeId', referencedColumnName: 'notificationId' })
    typeId: Notification;

}
