import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Engagement } from './engagement.entity';

@Entity('engagementType')
export class EngagementType {
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


    @OneToMany(() => Engagement, engagement => engagement.type)
    engagements: Engagement[];
}
