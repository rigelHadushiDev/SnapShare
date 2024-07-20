import { Like } from "src/like/like.entity";
import { Network } from "src/network/entities/network.entity";
import { Post } from "src/post/post.entity";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Comment } from "src/comment/comment.entity";
import { ApiProperty } from "@nestjs/swagger";
import { Notification } from "src/network/entities/notification.entity";

@Entity('user')
export class User {

    @PrimaryGeneratedColumn({ type: 'integer', name: 'userId' })
    userId: number;

    @ApiProperty({ example: 'example@example.com', description: 'Email address of the user', uniqueItems: true })
    @Column({ name: 'email', unique: true })
    email: string;

    @ApiProperty({ example: 'my_username', description: 'Username of the user', uniqueItems: true })
    @Column({ name: 'username', unique: true })
    username: string;

    @Column({ name: 'password' })
    password: string;

    @ApiProperty({ example: 'profile.jpg', description: 'File path to the user\'s profile image', nullable: true })
    @Column({ name: 'profileImg', type: 'varchar', nullable: true })
    profileImg: string;

    @ApiProperty({ example: 'A short description about the user', description: 'Profile description of the user', nullable: true })
    @Column({ name: 'profileDescription', type: 'text', nullable: true })
    profileDescription: string;

    @ApiProperty({ example: 'John', description: 'First name of the user', nullable: true, maxLength: 50 })
    @Column({ name: 'firstName', type: 'varchar', length: 50, nullable: true })
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'Last name of the user', nullable: true, maxLength: 50 })
    @Column({ name: 'lastName', type: 'varchar', length: 50, nullable: true })
    lastName: string;

    @ApiProperty({ example: false, description: 'Flag indicating if the user profile is private' })
    @Column({ name: 'isPrivate', type: 'boolean', default: false })
    isPrivate: boolean;

    @ApiProperty({ example: false, description: 'Flag indicating if the user is archived' })
    @Column({ name: 'archive', type: 'boolean', default: false })
    archive: boolean;

    @ApiProperty({ example: '2023-01-01T12:00:00Z', description: 'Date and time when the user was created' })
    @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
    createdAt: Date;

    @ApiProperty({ example: '2023-01-02T15:30:00Z', description: 'Date and time when the user was last updated' })
    @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
    updatedAt: Date;

    @OneToMany(() => Post, post => post.user, { cascade: true })
    posts: Post[];

    @OneToMany(() => Network, network => network.follower, { cascade: true })
    follower: Network[];

    @OneToMany(() => Network, network => network.followee, { cascade: true })
    followee: Network[];

    @OneToMany(() => Like, like => like.user, { cascade: true })
    likes: Like[];

    @OneToMany(() => Comment, comment => comment.user, { cascade: true })
    comments: Comment[];

    @OneToMany(() => Notification, notification => notification.createdUser, { cascade: true })
    createdNotifications: Notification[];

    @OneToMany(() => Notification, notification => notification.receivedUser, { cascade: true })
    receivedNotifications: Notification[];

}