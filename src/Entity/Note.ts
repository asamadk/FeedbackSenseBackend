import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn,
    ManyToOne,
    JoinColumn, 
    OneToOne
} from "typeorm";
import { Company } from "./CompanyEntity";
import { Person } from "./PersonEntity";
import { User } from "./UserEntity";
import { Organization } from "./OrgEntity";

enum Visibility {
    Private = "private",
    Team = "team",
    Public = "public"
}

@Entity()
export class Notes {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToOne(() => Person, { nullable: true })
    @JoinColumn({ name: "personId" })
    person?: Person;
  
    @OneToOne(() => Company, { nullable: true })
    @JoinColumn({ name: "companyId" })
    company?: Company;

    @OneToOne(() => User, { nullable: true })
    @JoinColumn({ name: "createdBy" })
    createdBy?: User;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "ownerId" })
    owner?: User;

    @Column()
    title!: string;

    @Column('text')
    description!: string;

    @Column({
        type: "enum",
        enum: Visibility,
    })
    visibility!: Visibility;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => Organization)
    organization: Organization;
}