import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('notificationType')
export class NotificationType {
    @PrimaryGeneratedColumn({ type: 'integer', name: 'notificationTypeId' })
    notificationTypeId: number;

    @Column({ type: 'varchar', length: 50 })
    notificationKey: string;

    @Column({ type: 'varchar', length: 255 })
    description: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    originType: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    targetType: string;
}