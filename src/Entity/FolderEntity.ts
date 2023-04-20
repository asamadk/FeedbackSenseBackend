import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // @Column({unique : true})
  @Column()
  name!: string;

  @Column()
  organization_id!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
  surveys: any;
}