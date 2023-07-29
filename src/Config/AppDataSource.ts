import { DataSource } from "typeorm"
import dotenv from "dotenv";

dotenv.config();

export class AppDataSource {

    static dataSource :DataSource;
    static instance :AppDataSource;

    static getInstance(){
        if(this.instance == null){
            this.instance = new AppDataSource();
        }
        return this.instance;
    }

    static setDataSource(dataSource :DataSource){
        this.dataSource = dataSource;
    }

    static getDataSource(){
        return this.dataSource;
    }

}

export const mainDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ["dist/Entity/*.js"],
    migrations: [
        "src/migration/**/*.ts"
    ],
    logging: false,
    synchronize: false,
});

export const testDataSource = new DataSource({
    "name": "test",
    "type": "mysql",
    "host": process.env.DB_HOST,
    "port": parseInt(process.env.DB_PORT),
    "username": process.env.DB_USER,
    "password": process.env.DB_PASSWORD,
    "database": process.env.DB_TEST_NAME,
    "synchronize": true,
    "migrationsRun": false,
    "logging": false,
    "dropSchema": true,
    "entities": ["dist/Entity/*.{js,ts}"],
    "migrations": ["dist/migration/*.js"],
});