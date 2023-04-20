import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { Plan } from "./PlanEntity";
import { User } from "./UserEntity";

@Entity()
export class Subscription {

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => User, user => user.subscriptions)
    user: User;

    @ManyToOne(() => Plan, plan => plan.subscriptions)
    plan: Plan;

    @Column()
    sub_limit : string

    @Column()
    billing_cycle : string

    @Column({nullable : true})
    modify_billing_field : boolean

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
