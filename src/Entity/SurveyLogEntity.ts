import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Survey } from "./SurveyEntity";

@Entity()
export class SurveyLog {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => Survey, survey => survey.logs, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'survey_id' })
    survey!: Survey;

    @Column({ nullable: true })
    user_id!: string;

    @CreateDateColumn()
    timestamp!: Date;

    @Column({ type: 'varchar', length: 50 })
    action_type!: string;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @Column({ type: 'text', nullable: true })
    data_before!: string;

    @Column({ type: 'text', nullable: true })
    data_after!: string;

    @Column({ type: 'varchar', length: 45, nullable: true })
    IP_address!: string;
}
