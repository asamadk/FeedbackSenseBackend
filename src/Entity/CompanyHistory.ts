import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from "typeorm";
import { Organization } from "./OrgEntity";

@Entity()
export class CompanyHistory {

    @PrimaryGeneratedColumn('uuid')
    id!: string;  // Using UUID for unique identifiers

    @Column()
    companyId: string;  // ID of the company to which the history relates

    @Column()
    fieldName: string;  // Name of the field that changed

    @Column({ type: "text", nullable: true })
    actionType: string;  // Type of action performed

    @CreateDateColumn()
    actionDate: Date;  // Timestamp when the action was recorded

    @Column({ nullable: true })
    extraInfo: string;  // Additional information about the action

    @Column({ nullable: true })
    changedBy: string;  // ID of the user who made the change, if applicable

    @ManyToOne(() => Organization)
    organization: Organization;
}
