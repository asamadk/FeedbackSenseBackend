import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { Credential } from "./Credential";

export enum AppCategories {
    CALENDAR = 'calendar',
    MESSAGING = 'messaging',
    OTHER = 'other',
    PAYMENT = 'payment',
    VIDEO = 'video',
    WEB3 = 'web3',
    AUTOMATION = 'automation',
    ANALYTICS = 'analytics',
    CONFERENCING = 'conferencing',
    CRM = 'crm',
}

@Entity()
export class App {

    @PrimaryColumn()
    slug: string;

    @Column('json', { nullable: true })
    keys?: any;

    @Column()
    categories: AppCategories;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => Credential, (credential) => credential.app)
    credentials: Credential[];

    @Column({ default: false })
    enabled: boolean;
}
