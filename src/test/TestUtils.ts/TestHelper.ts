import { DataSource, DataSourceOptions, Table } from 'typeorm';
import { logger } from '../../Config/LoggerConfig';
import { AppDataSource } from '../../Config/AppDataSource';

export class TestHelper {

    private static _instance: TestHelper;

    public static get instance(): TestHelper {
        if (!this._instance) this._instance = new TestHelper();
        return this._instance;
    }

    public dbConnect!: DataSource;

    async setupTestDB() {
        try {
            this.dbConnect = new DataSource({
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
                "entities": [__dirname + "/../../../dist/Entity/*.js"],
            } as DataSourceOptions);
            await this.dbConnect.initialize()
            AppDataSource.setDataSource(this.dbConnect);
        } catch (error) {
            logger.error(`TestHelper message - ${error.message}, stack trace - ${error.stack}`);
        }
    }

    async teardownTestDB() {
        try {
            try {
                await this.dbConnect.query('SET FOREIGN_KEY_CHECKS = 0');
                await this.dbConnect.query('DROP TABLE IF EXISTS survey_config ');
                await this.dbConnect.query('DROP TABLE IF EXISTS workflow ');
                await this.dbConnect.query('DROP TABLE IF EXISTS survey_response ');
                await this.dbConnect.query('DROP TABLE IF EXISTS survey_log ');
                await this.dbConnect.query('DROP TABLE IF EXISTS survey ');
                await this.dbConnect.query('DROP TABLE IF EXISTS survey_type ');
                await this.dbConnect.query('DROP TABLE IF EXISTS invoice  ');
                await this.dbConnect.query('DROP TABLE IF EXISTS subscription  ');
                await this.dbConnect.query('DROP TABLE IF EXISTS folder ');
                await this.dbConnect.query('DROP TABLE IF EXISTS notification ');
                await this.dbConnect.query('DROP TABLE IF EXISTS custom_settings ');
                await this.dbConnect.query('DROP TABLE IF EXISTS plan ');
                await this.dbConnect.query('DROP TABLE IF EXISTS templates ');
                await this.dbConnect.query('DROP TABLE IF EXISTS activity ');
                await this.dbConnect.query('DROP TABLE IF EXISTS company_history ');
                await this.dbConnect.query('DROP TABLE IF EXISTS company_tags ');
                await this.dbConnect.query('DROP TABLE IF EXISTS company_tag ');
                await this.dbConnect.query('DROP TABLE IF EXISTS custom_subscription ');
                await this.dbConnect.query('DROP TABLE IF EXISTS company_task ');
                await this.dbConnect.query('DROP TABLE IF EXISTS health_design ');
                await this.dbConnect.query('DROP TABLE IF EXISTS journey_log ');
                await this.dbConnect.query('DROP TABLE IF EXISTS mails ');
                await this.dbConnect.query('DROP TABLE IF EXISTS notes ');
                await this.dbConnect.query('DROP TABLE IF EXISTS person_task ');
                await this.dbConnect.query('DROP TABLE IF EXISTS task ');
                await this.dbConnect.query('DROP TABLE IF EXISTS usage_event ');
                await this.dbConnect.query('DROP TABLE IF EXISTS usage_event_type ');
                await this.dbConnect.query('DROP TABLE IF EXISTS usage_session ');
                await this.dbConnect.query('DROP TABLE IF EXISTS person ');
                await this.dbConnect.query('DROP TABLE IF EXISTS company ');
                await this.dbConnect.query('DROP TABLE IF EXISTS onboarding_stage');
                await this.dbConnect.query('DROP TABLE IF EXISTS risk_stage ');
                await this.dbConnect.query('DROP TABLE IF EXISTS journey_stage');
                await this.dbConnect.query('DROP TABLE IF EXISTS journey_sub_stage ');
                await this.dbConnect.query('DROP TABLE IF EXISTS user ');
                await this.dbConnect.query('DROP TABLE IF EXISTS organization ');
                await this.dbConnect.query('SET FOREIGN_KEY_CHECKS = 1');
            } catch (error) {
                logger.error(`Sub outer message - ${error.message}, stack trace - ${error.stack}`);
            }
        } catch (error) {
            logger.error(`Outer message - ${error.message}, stack trace - ${error.stack}`);
        } finally {
            try {
                await this.dbConnect.destroy();  // Close the TypeORM connection
            } catch (error) {
                logger.error(`Finally message - ${error.message}, stack trace - ${error.stack}`);
            }
        }
    }
    


}