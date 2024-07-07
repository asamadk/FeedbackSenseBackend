import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from "typeorm";
import { Survey } from "./SurveyEntity";
import { Company } from "./CompanyEntity";
import { Person } from "./PersonEntity";

@Entity()
export class SurveyResponse {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  survey_id!: string;

  @Column("longtext")
  response!: string;

  @Column('varchar')
  anonymousUserId: string

  @Column('longtext')
  userDetails: string

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Survey, survey => survey.responses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'survey_id' })
  survey!: Survey;

  @ManyToOne(() => Company, company => company.surveyResponses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company!: Company;

  @ManyToOne(() => Person, person => person.surveyResponses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'person_id' })
  person!: Person;
}
