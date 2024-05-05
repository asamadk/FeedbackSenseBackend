import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Organization } from "./OrgEntity";

@Entity()
export class HealthDesign {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({nullable : true})
    name!: string;

    @Column({nullable : true})
    segment : string

    @Column({nullable : true})
    config : string

    @ManyToOne(() => Organization, organization => organization.companies)
    organization: Organization;
}