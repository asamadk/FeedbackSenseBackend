import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Folder } from "./FolderEntity";
import { SurveyConfig } from "./SurveyConfigEntity";
import { SurveyType } from "./SurveyTypeEntity";
import { User } from "./UserEntity";
import { Workflow } from "./WorkflowEntity";
import { SurveyLog } from "./SurveyLogEntity";

@Entity()
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  folder_id!: string;

  @Column()
  survey_type_id!: string;

  @Column()
  user_id!: string;

  @Column({ default: false })
  is_published!: boolean;

  @Column({ default: false })
  is_archived!: boolean;

  @Column({ default: false })
  is_deleted!: boolean;

  @Column({ nullable: true })
  survey_design_json!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ nullable: true })
  workflow_id!: string;

  @ManyToOne(() => User, user => user.surveys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => SurveyType, surveyType => surveyType.surveys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'survey_type_id' })
  surveyType!: SurveyType;

  @ManyToOne(() => Folder, folder => folder.surveys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'folder_id' })
  folder!: Folder;

  @OneToMany(() => SurveyConfig, surveyConfig => surveyConfig.survey, { onDelete: 'CASCADE' })
  surveyConfigs!: SurveyConfig[];

  @OneToMany(() => Workflow, workflow => workflow.survey, { onDelete: 'CASCADE' })
  workflows!: Workflow[];
  
  @OneToMany(() => SurveyLog, log => log.survey)
  logs: SurveyLog[];

  responses: any
}