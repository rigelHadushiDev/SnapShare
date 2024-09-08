import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Engagement } from './engagement.entity';

@Entity('engagementType')
export class EngagementType {
    @PrimaryGeneratedColumn({ type: 'integer', name: 'engagementTypeId' })
    engagementTypeId: number;

    @Column({ type: 'varchar', length: 50 })
    type: string;

    @OneToMany(() => Engagement, engagement => engagement.type)
    engagements: Engagement[];
}
