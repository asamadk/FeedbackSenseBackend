import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Organization } from './OrgEntity';

@Entity()
@Unique(['organizationId', 'fKey'])
export class CustomSettings {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  fKey!: string;

  @Column({ type: 'longtext' })
  fValue!: string;

  @Column()
  organizationId!: string;

  @ManyToOne(() => Organization, organization => organization.customSettings, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'organizationId' })
  organization!: Organization;
}
