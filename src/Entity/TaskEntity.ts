import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    ManyToOne
  } from "typeorm";
import { Person } from "./PersonEntity";
import { Company } from "./CompanyEntity";
import { User } from "./UserEntity";
import { Organization } from "./OrgEntity";
  
  
  @Entity()
  export class Task {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @OneToOne(() => Person, { nullable: true })
    @JoinColumn({ name: "personId" })
    person?: Person;
  
    @OneToOne(() => Company, { nullable: true })
    @JoinColumn({ name: "companyId" })
    company?: Company;
  
    @Column()
    title!: string;
  
    @Column('text')
    description!: string;
  
    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "ownerId" })
    owner?: User;
  
    @Column({
        type: "enum",
        enum: ["Low", "Medium", "High", "Urgent"],
    })
    priority!: 'Low' | 'Medium' | 'High' | 'Urgent';
  
    @Column('date')
    dueDate!: Date;
  
    @Column({
        type : 'enum',
        enum : ['Open','InProgress','Completed','Cancelled']
    })
    status!: 'Open' | 'InProgress' | 'Completed' | 'Cancelled';
  
    @CreateDateColumn()
    created_at!: Date;
  
    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => Organization)
    organization: Organization;

  }
  