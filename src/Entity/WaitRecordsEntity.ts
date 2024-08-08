import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { recordType } from "../Types/ApiTypes";

@Entity()
export class WaitRecordsEntity {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar' })
    recordType: recordType;

    @Column({ type: 'varchar', length: 36 })
    recordId: string;

    @Column({ type: 'varchar', length: 36 })
    orgId: string;

    @Column({ type: 'varchar', length: 36 })
    flowId: string;

    @Column({nullable : true})
    componentId :string;

    @Column()
    waitUntil: Date;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

}