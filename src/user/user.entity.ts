import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable,
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    userid: string;

    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column({ default: 0 })
    deleted: boolean;

    @CreateDateColumn({ type: 'timestamp' })
    createdat: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedat: Date;
}
