import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from 'src/user/user.entity';

@Entity('profile')
export class Profile {

    @PrimaryGeneratedColumn({ name: 'profileId' })
    profileId: number;

    @Column({ name: 'userId', type: 'integer' })
    userId: number;

    @Column({ name: 'profileImg', type: 'text', nullable: true })
    profileImg: string;

    @Column({ name: 'profileDescription', type: 'text', nullable: true })
    profileDescription: string;

    @Column({ name: 'firstName', type: 'varchar', length: 50 })
    firstName: string;

    @Column({ name: 'lastName', type: 'varchar', length: 50 })
    lastName: string;

    @Column({ name: 'isPrivate', type: 'boolean', default: false })
    isPrivate: boolean;

    @Column({ name: 'deleted', type: 'boolean', default: false })
    deleted: boolean;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
    updatedAt: Date;

    @OneToOne(() => User)
    @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
    user: User;
}
