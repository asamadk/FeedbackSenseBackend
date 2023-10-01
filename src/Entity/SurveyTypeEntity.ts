import { Entity, PrimaryGeneratedColumn, Column, OneToMany, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { Survey } from "./SurveyEntity";

@Entity()
export class SurveyType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  label!: string

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => Survey, survey => survey.surveyType,{onDelete : 'CASCADE'})
  surveys!: Survey[];
}