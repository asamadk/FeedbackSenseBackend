import { DataSource } from "typeorm"

export const getDataSource = (isTest: boolean): DataSource => {
    if (isTest === true) {
        return testDataSource;
    } else {
        return mainDataSource
    }
}


export const mainDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "password",
    database: "feedbackSense",
    entities: ["dist/Entity/*.js"],
    migrations: ["dist/migration/*.js"],
    logging: true,
    synchronize: false,
    migrationsTableName: "feedbackSense_migration_table",
});

export const testDataSource = new DataSource({
    "name": "test",
    "type": "mysql",
    "host": "localhost",
    "port": 3306,
    "username": "root",
    "password": "password",
    "database": "test_feedbackSense",
    "synchronize": true,
    "logging": false,
    "dropSchema": true,
    "entities": ["dist/Entity/*.{js,ts}"],
    "migrations": ["dist/migration/*.js"],
});