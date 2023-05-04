import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Survey } from "./SurveyEntity";

@Entity()
export class SurveyConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  survey_id!: string;

  @Column({nullable : true})
  time_limit!: string;

  @Column()
  response_limit!: number;

  @ManyToOne(() => Survey, survey => survey.surveyConfigs,{
    onDelete : 'CASCADE'
  })
  @JoinColumn({ name: 'survey_id' })
  survey!: Survey;
}