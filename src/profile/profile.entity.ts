import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity('profile')
export class Profile {

    @PrimaryGeneratedColumn({ name: 'id' })
    profileId: number;

    @Column({ name: 'user_id', type: 'integer' })
    userId: number;

    @Column({ name: 'profile_img', type: 'text', nullable: true })
    profileImg: string;

    @Column({ name: 'profile_description', type: 'text', nullable: true })
    profileDescription: string;

    @Column({ name: 'first_name', type: 'varchar', length: 50 })
    firstName: string;

    @Column({ name: 'last_name', type: 'varchar', length: 50 })
    lastName: string;

    @Column({ name: 'is_private', type: 'boolean', default: false })
    isPrivate: boolean;

    @Column({ name: 'deleted', type: 'boolean', default: false })
    deleted: boolean;

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id', referencedColumnName: 'userId' })
    user: User;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;
}
