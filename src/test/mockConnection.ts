import { DataSource } from 'typeorm';
import { getDataSource } from '../Config/AppDataSource';

let mockDataSource: DataSource;

const mockConnection = {
    async create() {
        mockDataSource = await getDataSource(true).initialize();
        return mockDataSource;
    },

    async close() {
        await deleteDatabase(mockDataSource);
    },

    async clear() {
        await cleanDatabase(mockDataSource);
    },

};

const deleteDatabase = async (connection: DataSource): Promise<void> => {
    try {
        if(connection == null){return}
        const entities = connection.entityMetadatas;
        const tableNames = entities.map((entity) => `${entity.tableName}`).join(", ");
        await connection.query(`DROP TABLE IF EXISTS ${tableNames};`);
    } catch (error) {
        throw new Error(`ERROR: Removing test database: ${error}`);
    }
}

const cleanDatabase = async (connection: DataSource): Promise<void> => {
    // try {
    //     if(connection == null){return}
    //     const entities = connection.entityMetadatas;
    //     for (const entity of entities) {
    //         const repository = connection.getRepository(entity.name); // Get repository
    //         await repository.clear(); // Clear each entity table's content
    //     }
    // } catch (error) {
    //     throw new Error(`ERROR: Cleaning test database: ${error}`);
    // }
}

export default mockConnection;