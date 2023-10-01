import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Templates {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    category: string;

    @Column()
    subCategory: string;

    @Column('longtext')
    data: string;

    @Column({ nullable : true})
    design_json!: string;

    @Column()
    questionCount: number;

    @Column()
    timeTaken: number;

    @Column()
    name: string;

    @Column()
    description: string;
}
