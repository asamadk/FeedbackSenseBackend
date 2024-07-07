import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
  } from "typeorm";
import { Organization } from "./OrgEntity";
  
  @Entity()
  export class CustomSubscription {
    @PrimaryGeneratedColumn('uuid')
    id!: string;
  
    @Column()
    name!: string;
  
    @Column()
    billingCycle!: string;
  
    @Column('decimal', { precision: 10, scale: 2 })
    price!: number;
  
    @Column({
      type: "enum",
      enum: ["static", "usage-based"],
    })
    type!: "static" | "usage-based";
  
    @Column({ nullable: true })
    license?: number;
  
    @CreateDateColumn()
    created_at!: Date;
  
    @UpdateDateColumn()
    updated_at!: Date;
  
    @ManyToOne(() => Organization)
    @JoinColumn({ name: "organizationId" })
    organization!: Organization;
  
  }
  