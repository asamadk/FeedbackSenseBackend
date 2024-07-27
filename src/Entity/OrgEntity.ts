import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, OneToOne, UpdateDateColumn } from "typeorm";
import { PrimaryGeneratedColumn } from "typeorm/decorator/columns/PrimaryGeneratedColumn";
import { CustomSettings } from "./CustomSettingsEntity";
import { Subscription } from "./SubscriptionEntity";
import { Company } from "./CompanyEntity";
import { Coupon } from "./CouponEntity";

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  payment_customerId?: string

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @OneToMany(() => CustomSettings, keyValue => keyValue.organization)
  customSettings!: CustomSettings[];

  @OneToOne(() => Subscription, subscription => subscription.organization)
  subscription: Subscription;

  @OneToMany(() => Company, keyValue => keyValue.organization)
  companies!: Company[];
  
  @OneToMany(() => Coupon, coupon => coupon.organization)
  coupons: Coupon[];

}