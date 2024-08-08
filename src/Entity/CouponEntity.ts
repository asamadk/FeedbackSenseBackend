import { Entity, PrimaryColumn, Column, ManyToMany, JoinTable, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Organization } from './OrgEntity';

@Entity()
export class Coupon {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ default: false })
    isUsed: boolean;

    @ManyToOne(() => Organization, organization => organization.coupons)
    organization: Organization;
}