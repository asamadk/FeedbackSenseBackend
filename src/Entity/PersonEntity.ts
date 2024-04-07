import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
  } from "typeorm";
import { Company } from "./CompanyEntity";
import { Organization } from "./OrgEntity";

  
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
  
    @Column({nullable : true})
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
    @JoinColumn({name : 'organizationId'})
    organization: Organization;

  }
  