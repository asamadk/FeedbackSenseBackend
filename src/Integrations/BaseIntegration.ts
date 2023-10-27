import { logger } from "../Config/LoggerConfig";

abstract class BaseIntegration {
    protected apiKey: string;
    protected endpoint: string;

    constructor(apiKey: string, endpoint: string) {
        this.apiKey = apiKey;
        this.endpoint = endpoint;
    }

    abstract initialize(): Promise<boolean>;

    abstract sendData(entity: string,data: any): Promise<any>;

    abstract fetchData(entity: string, entityId?: string): Promise<any>;

    protected handleError(error: Error): void {
        logger.error(`Integration Error`);
        logger.error(`message - ${error.message}, stack trace - ${error.stack}`);
    }
}

export default BaseIntegration;
