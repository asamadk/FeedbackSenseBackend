import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { Person } from "./PersonEntity";
import { Company } from "./CompanyEntity";


@Entity()
export class UsageSession {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column("timestamp")
    startTime: Date;

    @Column("timestamp",{nullable : true})
    endTime: Date;

    @Column()
    sessionId : string;

    @Column("bigint",{nullable : true})
    duration: number;

    @Column("varchar")
    ipAddress: string;

    @Column("text")
    userAgent: string;

    @ManyToOne(() => Person, person => person.sessions)
    @JoinColumn({ name: "personId" })
    person: Person;

    @ManyToOne(() => Company, company => company.sessions)
    @JoinColumn({ name: "companyId" })
    company: Company;
}
