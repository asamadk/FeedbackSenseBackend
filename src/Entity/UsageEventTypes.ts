import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from "typeorm";
import { Organization } from "./OrgEntity";

@Entity()
export class UsageEventType {
    
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    //custom event name
    @Column()
    eventName: string;

    //type of event 'click','view', etc
    @Column()
    eventType: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

}
