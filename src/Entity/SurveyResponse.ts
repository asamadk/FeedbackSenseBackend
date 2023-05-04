import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Survey } from "./SurveyEntity";

@Entity()
export class SurveyResponse {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  survey_id!: string;

  @Column("longtext")
  response!: string;

  @Column('varchar')
  anonymousUserId : string

  @Column('longtext')
  userDetails : string

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Survey, survey => survey.responses,{onDelete : 'CASCADE'})
  @JoinColumn({ name: 'survey_id' })
  survey!: Survey;
}
