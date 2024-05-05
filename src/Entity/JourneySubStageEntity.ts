import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
    UpdateDateColumn,
    OneToMany
} from "typeorm";
import { Organization } from "./OrgEntity";
import { JourneyStage } from "./JourneyStageEntity";
import { Company } from "./CompanyEntity";

@Entity()
export class JourneySubStage {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name: string;

    @Column()
    isEnabled: boolean;

    @Column()
    position: number;

    @Column()
    isEnd: boolean

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organizationId' })
    organization: Organization;

    // @ManyToOne(() => JourneyStage)
    // @JoinColumn({ name: 'JourneyStageId' })
    // journeyStage: JourneyStage;
    @Column()
    journeyType :string

    @OneToMany(() => Company, keyValue => keyValue.stage)
    companies!: Company[];
}
