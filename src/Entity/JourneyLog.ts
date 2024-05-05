import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Company } from "./CompanyEntity";
import { JourneyStage } from "./JourneyStageEntity";
import { JourneySubStage } from "./JourneySubStageEntity";


@Entity()
export class JourneyLog {
    
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'companyId' })
    company: Company;

    @ManyToOne(() => JourneyStage)
    @JoinColumn({ name: 'journeyId' })
    journey: JourneyStage;

    @ManyToOne(() => JourneySubStage)
    @JoinColumn({ name: 'journeySubStageId' })
    journeySubStage: JourneySubStage;

    @Column({ type: 'timestamp', nullable: true })
    enterTime: Date;

    @Column({ type: 'timestamp', nullable: true })
    exitTime: Date;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
