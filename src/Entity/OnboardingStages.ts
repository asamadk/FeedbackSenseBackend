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
import { Company } from "./CompanyEntity";

@Entity()
export class OnboardingStage {

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

    @OneToMany(() => Company, keyValue => keyValue.onboardingStage)
    companies!: Company[];

}
