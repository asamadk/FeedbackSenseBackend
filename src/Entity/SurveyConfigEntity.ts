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

  @Column({nullable : true})
  emails!: string;

  @Column()
  response_limit!: number;

  @Column()
  widget_position!: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

  @Column()
  button_color !: string

  @Column()
  button_text_color !: string

  @ManyToOne(() => Survey, survey => survey.surveyConfigs,{
    onDelete : 'CASCADE'
  })

  @JoinColumn({ name: 'survey_id' })
  survey!: Survey;
}