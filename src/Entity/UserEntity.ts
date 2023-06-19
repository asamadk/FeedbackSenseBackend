import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {

//TODO add same domain same org field

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column()
    email!: string;

    @Column()
    oauth_provider!: string;

    @Column({nullable : true})
    oauth_id!: string;

    @Column({ nullable : true})
    organization_id!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @Column()
    emailVerified!: boolean;

    @Column({ nullable: true })
    address!: string;

    @Column({ nullable: true })
    image!: string;
    
    surveys: any;
    notifications: any;
    subscriptions: any;
}