import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Organization } from "./OrgEntity";
import { User } from "./UserEntity";
import { CustomSubscription } from "./CustomSubscriptionEntity";
import { CompanyTag } from "./CompanyTagEntity";
import { Task } from "./TaskEntity";
import { SurveyResponse } from "./SurveyResponse";
import { UsageEvent } from "./UsageEvent";
import { UsageSession } from "./UsageSession";
import { JourneyStage } from "./JourneyStageEntity";
import { OnboardingStage } from "./OnboardingStages";
import { RiskStage } from "./RiskStages";

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

    @Column({default : 'Free'})
    contractStatus?: 'Paying' | 'Free';

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "ownerId" }) // This creates the ownerId column in the Company table
    owner?: User;

    @Column({
        type: 'enum',
        enum: CompanyStatus,
        default: CompanyStatus.Active
    })
    status!: CompanyStatus;

    @Column({ type: 'date', nullable: true })
    startDate?: Date;

    @Column('date', { nullable: true })
    nextRenewalDate?: Date;

    @Column('decimal', { precision: 10, scale: 2, nullable: true })
    totalContractAmount?: number;

    @Column('text', { nullable: true })
    address?: string;

    @Column({ type: 'int', nullable: true })
    healthScore?: number;

    @Column({nullable : true})
    attributeHealthScore?: string;

    @Column({ type: 'int', nullable: true })
    npsScore?: number;

    @Column({ type: 'int', nullable: true })
    csatScore?: number;

    @Column({ type: 'int', nullable: true })
    avgNpsScore?: number;

    @Column({ type: 'int', nullable: true })
    avgCsatScore?: number;

    @Column({ nullable: true })
    usageFrequency?: string;

    @Column('timestamp', { nullable: true })
    lastContactDate?: Date;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => CustomSubscription)
    @JoinColumn({ name: 'subscriptionId' })
    subscription!: CustomSubscription

    @ManyToOne(() => Organization, organization => organization.companies)
    organization: Organization;

    @ManyToOne(() => JourneyStage, journey => journey.companies)
    stage: JourneyStage;

    @ManyToOne(() => OnboardingStage, journey => journey.companies)
    onboardingStage: OnboardingStage;

    @ManyToOne(() => RiskStage, riskStage => riskStage.companies,{nullable : true})
    riskStage: RiskStage;

    @ManyToMany(() => CompanyTag, tag => tag.companies, { onDelete: 'CASCADE' })
    tags!: CompanyTag[];

    @ManyToMany(() => Task, task => task.company, { onDelete: 'CASCADE' })
    @JoinTable({
        name: "company_task", // Name of the join table
        joinColumn: { name: "taskId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "companyId", referencedColumnName: "id" }
    })
    tasks!: Task[];

    @OneToMany(() => SurveyResponse, surveyResponse => surveyResponse.company)
    surveyResponses!: SurveyResponse[];

    @OneToMany(() => UsageEvent, usageEvent => usageEvent.company)
    events!: UsageEvent[];

    @OneToMany(() => UsageSession, usageSession => usageSession.company)
    sessions!: UsageSession[];

}