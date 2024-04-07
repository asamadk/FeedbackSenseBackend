import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    OneToOne,
    UpdateDateColumn
  } from "typeorm";
import { Person } from "./PersonEntity";
import { Company } from "./CompanyEntity";
import { Organization } from "./OrgEntity";
  
  
  @Entity('mails')
  export class Mail {
    @PrimaryGeneratedColumn()
    id!: number;
  
    @OneToOne(() => Person, { nullable: true })
    @JoinColumn({ name: "personId" })
    person?: Person;
  
    @OneToOne(() => Company, { nullable: true })
    @JoinColumn({ name: "companyId" })
    company?: Company;
  
    @Column()
    origin!: string;
  
    @Column()
    from!: string;
  
    @Column()
    to!: string;
  
    @Column()
    subject!: string;
  
    @Column('text')
    body!: string;
  
    @Column('text', { nullable: true })
    cc?: string;
  
    @Column('text', { nullable: true })
    bcc?: string;
  
    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => Organization)
    organization: Organization;
  }
  