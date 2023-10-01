import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Subscription } from "./SubscriptionEntity";


@Entity()
export class Invoice {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Subscription, (subscription) => subscription.invoices, {
        nullable: false,
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "subscription_id" })
    subscription: Subscription;

    @Column({ type: "integer", nullable: false })
    amountCents: number;

    @Column({ type: "timestamp", nullable: false })
    invoiceDate: Date;

    @Column()
    stripeSubscriptionId: string;

    @Column()
    stripeInvoiceId: string

    @Column()
    currency: string

    @Column()
    billingInterval: string

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt: Date;
}
