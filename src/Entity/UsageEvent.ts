import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { Person } from "./PersonEntity";
import { Company } from "./CompanyEntity";

@Entity()
export class UsageEvent {
    
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column("varchar")
    eventType: string;
    // "login" | "click" | "view" and custom events

    @CreateDateColumn()
    createdDate: Date;

    @Column()
    eventName: string;

    @Column()
    sessionId : string;

    @Column({
        type: "text",
        nullable: true
    })
    extraInfo: string;

    @ManyToOne(() => Person, person => person.events)
    @JoinColumn({ name: "personId" })
    person: Person;

    @ManyToOne(() => Company, company => company.events)
    @JoinColumn({ name: "companyId" })
    company: Company;
}
