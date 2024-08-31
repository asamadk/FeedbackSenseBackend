import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./UserEntity";
import { App } from "./App";

@Entity()
export class Credential {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    type: string;

    @Column('json')
    key: any;

    @Column()
    userId!: string;

    @ManyToOne(() => User, (user) => user.credentials, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user?: User;

    @Column()
    appId!: string;

    @ManyToOne(() => App, (app) => app.credentials, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'appId' })
    app?: App;
}
