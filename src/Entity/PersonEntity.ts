import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany
} from "typeorm";
import { Company } from "./CompanyEntity";
import { Organization } from "./OrgEntity";
import { Task } from "./TaskEntity";
import { SurveyResponse } from "./SurveyResponse";
import { UsageEvent } from "./UsageEvent";
import { UsageSession } from "./UsageSession";


@Entity()
export class Person {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  title?: string;

  @Column({ nullable: true })
  role?: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: "companyId" }) // This links the companyId column to the Company entity
  company!: Company;

  @Column('text', { nullable: true })
  communicationPreferences?: string; // Consider storing JSON data or defining an enum

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  lastContactedDate?: Date;

  @Column({ type: 'float', nullable: true })
  engagementScore?: number;

  @Column({ default: 0 })
  supportTicketCount!: number;

  @Column({ default: false })
  trainingCompleted!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @ManyToMany(() => Task, task => task.person)
  @JoinTable({
    name: "person_task", // Name of the join table
    joinColumn: { name: "taskId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "personId", referencedColumnName: "id" }
  })
  tasks!: Task[];

  @OneToMany(() => SurveyResponse, surveyResponse => surveyResponse.company)
  surveyResponses!: SurveyResponse[];

  @OneToMany(() => UsageEvent, usageEvent => usageEvent.person)
  events!: UsageEvent[];

  @OneToMany(() => UsageSession, usageSession => usageSession.person)
  sessions!: UsageSession[];

}
