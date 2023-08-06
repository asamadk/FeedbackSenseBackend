import { DataSource } from "typeorm"
import dotenv from "dotenv";
import { logger } from "./LoggerConfig";
import { StartUp } from "../Helpers/Startup";

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

export const initializeDataSource = async() => {
    try {
        await mainDataSource.initialize();
        AppDataSource.setDataSource(mainDataSource);
        logger.info('Data source initialized');
        await new StartUp().startExecution();
      } catch (error) {
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
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