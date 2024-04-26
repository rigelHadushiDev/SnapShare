import { Like } from "src/like/like.entity";
import { Network } from "src/network/network.entity";
import { Post } from "src/post/post.entity";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Comment } from "src/comment/comment.entity";

@Entity('user')
export class User {

    @PrimaryGeneratedColumn({ name: 'userId' })
    userId: number;

    @Column({ name: 'email', unique: true })
    email: string;

    @Column({ name: 'username', unique: true })
    username: string;

    @Column({ name: 'password' })
    password: string;

    @Column({ name: 'deleted', default: false })
    deleted: boolean;

    @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
    updatedAt: Date;

    @OneToMany(() => Post, post => post.user)
    posts: Post[];

    @OneToMany(() => Network, network => network.follower)
    follower: Network[];

    @OneToMany(() => Network, network => network.followee)
    followee: Network[];

    @OneToMany(() => Like, like => like.user)
    likes: Like[];

    @OneToMany(() => Comment, comment => comment.user)
    comments: Comment[];
}