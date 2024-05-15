import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Company } from "./CompanyEntity";
import { JourneyStage } from "./JourneyStageEntity";
import { OnboardingStage } from "./OnboardingStages";
import { RiskStage } from "./RiskStages";


@Entity()
export class JourneyLog {
    
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'companyId' })
    company: Company;

    @ManyToOne(() => JourneyStage,{nullable : true})
    @JoinColumn({ name: 'journeyId'})
    journey: JourneyStage;

    @ManyToOne(() => OnboardingStage,{nullable : true})
    @JoinColumn({ name: 'onboardingStageId'})
    onboarding: OnboardingStage;

    @ManyToOne(() => RiskStage,{nullable : true})
    @JoinColumn({ name: 'riskStageId'})
    risk: RiskStage;

    @Column({ type: 'timestamp', nullable: true })
    enterTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    exitTime: Date;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
