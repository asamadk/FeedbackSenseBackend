import { Column, CreateDateColumn, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Organization } from "./OrgEntity";
import { User } from "./UserEntity";
import { CustomSubscription } from "./CustomSubscriptionEntity";
import { CompanyTag } from "./CompanyTagEntity";

enum CustomerLifecycleStage {
    Onboarding = "Onboarding",
    Active = "Active",
    Engaged = "Engaged",
    AtRisk = "At Risk",
    Churned = "Churned",
    Expansion = "Expansion",
    Renewal = "Renewal",
    Advocate = "Advocate"
}

enum CompanyStatus {
    Active = "Active",
    Inactive = "Inactive",
    Verified = "Verified",
    Unverified = "Unverified",
    Compliant = "Compliant",
    NonCompliant = "Non-Compliant",
    GoodStanding = "Good Standing",
    Delinquent = "Delinquent"
}

@Entity()
export class Company {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column({ nullable: true })
    website?: string;

    @Column({ nullable: true })
    industry?: string;

    @Column({
        type: "enum",
        enum: CustomerLifecycleStage,
        default: CustomerLifecycleStage.Onboarding
    })
    lifecycleStage?: CustomerLifecycleStage;
    

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "ownerId" }) // This creates the ownerId column in the Company table
    owner?: User;

    @Column({
        type : 'enum',
        enum : CompanyStatus,
        default : CompanyStatus.Active
    })
    status!: CompanyStatus;

    @Column({type : 'date',nullable : true})
    startDate?: Date;

    @Column('date', { nullable: true })
    nextRenewalDate?: Date;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    totalContractAmount?: number;

    @Column('timestamp', { nullable: true })
    lastActivityDate?: Date;

    @Column({ nullable: true })
    licenseCount?: number;

    @Column({ nullable: true })
    subscriptionPlan?: string;

    @Column('text', { nullable: true })
    address?: string;

    @Column({ type: 'int', nullable: true })
    healthScore?: number;

    @Column({ type: 'int', nullable: true })
    npsScore?: number;

    @Column({ nullable: true })
    churnRiskLevel?: string;

    @Column({ nullable: true })
    usageFrequency?: string;

    @Column('timestamp', { nullable: true })
    lastContactDate?: Date;

    @Column({ nullable: true })
    onboardingCompletionStatus?: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => CustomSubscription)
    @JoinColumn({name : 'subscriptionId'})
    subscription! : CustomSubscription

    @ManyToOne(() => Organization, organization => organization.companies)
    organization: Organization;

    @ManyToMany(() => CompanyTag, tag => tag.companies)
    tags!: CompanyTag[];

}