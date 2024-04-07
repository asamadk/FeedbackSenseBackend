import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToMany, JoinTable, UpdateDateColumn, ManyToOne } from "typeorm";
import { Company } from "./CompanyEntity";
import { Organization } from "./OrgEntity";

@Entity()
export class CompanyTag {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    name!: string;

    @Column('text', { nullable: true })
    description?: string;

    @ManyToMany(() => Company,company => company.tags)
    @JoinTable({
        name: "company_tags", // Name of the join table
        joinColumn: { name: "tagId", referencedColumnName: "id" },
        inverseJoinColumn: { name: "companyId", referencedColumnName: "id" }
    })
    companies!: Company[];

    @CreateDateColumn()
    created_at!: Date;
  
    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => Organization)
    organization: Organization;
}
