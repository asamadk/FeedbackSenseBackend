import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { Plan } from "./PlanEntity";
import { User } from "./UserEntity";
import { Organization } from "./OrgEntity";

@Entity()
export class Subscription {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, user => user.subscriptions, { onDelete: 'CASCADE',nullable : true })
    user?: User;

    @OneToOne(() => Organization, organization => organization.subscription)
    @JoinColumn()
    organization: Organization;

    @ManyToOne(() => Plan, plan => plan.subscriptions, { onDelete: 'CASCADE' })
    plan: Plan;

    @Column()
    sub_limit: string

    @Column()
    billing_cycle: string

    @Column({ nullable: true })
    modify_billing_field: boolean

    @Column({ nullable: true })
    razorpay_subscription_id: string;

    @Column()
    start_date: Date;

    @Column()
    end_date: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
    invoices: any;
}
