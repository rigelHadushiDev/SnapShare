import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, OneToMany } from 'typeorm';
import { Notification } from './notification.entity';

@Entity('notificationType')
export class NotificationType {

    @PrimaryGeneratedColumn({ name: 'notificationTypeId' })
    notificationTypeId: number;

    @Column({ name: 'notificationKey', type: 'varchar', nullable: false })
    notificationKey: string;

    @Column({ name: 'description', type: 'varchar', nullable: true })
    description: string;

    @Column({ name: 'originType', type: 'varchar', nullable: true })
    originType: string;

    @Column({ name: 'targetType', type: 'varchar', nullable: true })
    targetType: string;

    @OneToMany(() => Notification, notification => notification.receivedNotifications, { nullable: true })
    @JoinColumn({ name: 'notificationTypeId', referencedColumnName: 'notificationId' })
    typeId: Notification;

}
