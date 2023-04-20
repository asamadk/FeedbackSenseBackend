import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Survey } from './SurveyEntity';


@Entity()
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  surveyId: string;

  @ManyToOne(() => Survey, survey => survey.workflows)
  survey: Survey;

  @Column("longtext")
  json: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
