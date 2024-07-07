import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToOne,
  ManyToMany
} from "typeorm";
import { Person } from "./PersonEntity";
import { Company } from "./CompanyEntity";
import { User } from "./UserEntity";
import { Organization } from "./OrgEntity";


@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToMany(() => Person, person => person.tasks, { nullable: true,onDelete : 'CASCADE' })
  person?: Person[];

  @ManyToMany(() => Company, company => company.tasks, { nullable: true,onDelete : 'CASCADE' })
  company?: Company[];

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
    type: 'enum',
    enum: ['Open', 'InProgress', 'Completed', 'Cancelled'],
    default : 'Open'
  })
  status!: 'Open' | 'InProgress' | 'Completed' | 'Cancelled';

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @ManyToOne(() => Organization)
  organization: Organization;

}
