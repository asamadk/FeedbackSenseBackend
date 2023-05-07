import { DataSource } from "typeorm"
import dotenv from "dotenv";

dotenv.config();

export const getDataSource = (isTest: boolean): DataSource => {
    if (isTest === true) {
        return testDataSource;
    } else {
        return mainDataSource
    }
    // return testDataSource;
}

const databaseConfig : any = {
    type: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ["dist/Entity/*.js"],
    migrations: ["dist/migration/*.js"],
    logging: true,
    synchronize: false,
    migrationsTableName: "feedbackSense_migration_table",
}


export const mainDataSource = new DataSource(databaseConfig);

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