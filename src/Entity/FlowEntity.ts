import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Workflow } from './WorkflowEntity';
import { Survey } from './SurveyEntity';
import { Organization } from './OrgEntity';
import { User } from './UserEntity';

export type flowTypes = 'company' | 'person' | 'task';

@Entity()
export class Flow {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column({ default: false })
    is_published!: boolean;

    @Column({ default: false })
    is_archived!: boolean;

    @Column({ default: false })
    is_deleted!: boolean;

    @Column({ nullable: true })
    workflow_id!: string;

    @Column()
    type : flowTypes

    @Column()
    user_id!: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, user => user.flows, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => Organization)
    organization: Organization;

    @OneToMany(() => Workflow, workflow => workflow.flow, { onDelete: 'CASCADE' })
    workflows!: Workflow[];

}
