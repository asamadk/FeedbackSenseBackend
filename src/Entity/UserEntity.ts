import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class User {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column()
    email!: string;

    @Column()
    oauth_provider!: string;

    @Column({ nullable: true })
    oauth_id!: string;

    @Column({ nullable: true })
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

    @Column({ type: 'enum', enum: ['OWNER', 'ADMIN', 'USER', 'GUEST'], default: 'OWNER' })
    role!: 'OWNER' | 'ADMIN' | 'USER' | 'GUEST';

    @Column({ default: false })
    isDeleted!: boolean;

    surveys: any;
    notifications: any;
    subscriptions: any;
}