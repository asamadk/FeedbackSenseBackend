import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: false })
  price_cents: number;

  @Column({ type: 'int', nullable: false }) // Add this field
  price_cents_monthly: number; // New field

  @Column()
  sub_limit : string

  @Column({type : 'varchar', nullable : true})
  currency : string

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
  subscriptions: any;
}
