import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToOne
  } from "typeorm";
import { Person } from "./PersonEntity";
import { Company } from "./CompanyEntity";
import { User } from "./UserEntity";
import { Organization } from "./OrgEntity";
  
enum ActivityType {
    Email = "Email",
    Call = "Call",
    Meeting = "Meeting",
    SupportTicket = "Support Ticket",
    Training = "Training",
    ProductUsage = "Product Usage",
    Survey = "Survey",
    Update = "Update",
    Note = "Note",
    Other = "Other"
}

enum ActivityStatus {
    Planned = "Planned",
    InProgress = "InProgress",
    Completed = "Completed",
    Cancelled = "Cancelled"
}

  @Entity()
  export class Activity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @OneToOne(() => Person, { nullable: true })
    @JoinColumn({ name: "personId" })
    person?: Person;
  
    @OneToOne(() => Company, { nullable: true })
    @JoinColumn({ name: "companyId" })
    company?: Company;
  
    @Column({
      type: "enum",
      enum: ActivityType,
    })
    type!: ActivityType;
  
    @Column()
    subject!: string;
  
    @Column('text')
    description!: string;
  
    @Column('text', { nullable: true })
    outcome?: string;
  
    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "ownerId" })
    owner?: User;
  
    @Column({ 
        type : 'enum',
        enum : ActivityStatus
    })
    status?: ActivityStatus;
  
    @CreateDateColumn()
    startTime!: Date;
  
    @Column('timestamp', { nullable: true })
    endTime?: Date;
  
    @Column({ type: 'int', nullable: true })
    duration?: number; // Duration in minutes
  
    @CreateDateColumn()
    created_at!: Date;
  
    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => Organization)
    organization: Organization;

  }
  