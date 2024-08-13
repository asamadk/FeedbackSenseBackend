import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Survey } from './SurveyEntity';
import { Flow } from './FlowEntity';


@Entity()
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  surveyId: string;

  @Column()
  flowId : string

  @ManyToOne(() => Survey, survey => survey.workflows, { onDelete: 'CASCADE', nullable: true })
  survey: Survey | null;

  @ManyToOne(() => Flow, flow => flow.workflows, { onDelete: 'CASCADE', nullable: true })
  flow: Flow | null;

  @Column("longtext")
  json: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
