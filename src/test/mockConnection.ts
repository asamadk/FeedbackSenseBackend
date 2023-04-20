import { DataSource } from 'typeorm';
import { getDataSource } from '../Config/AppDataSource';

let mockDataSource : DataSource ;

const mockConnection = {
    async create() {
        mockDataSource = await getDataSource(true).initialize();
        return mockDataSource;
    },

    async close() {
        await mockDataSource.destroy();
    },

    async clear() {
        const entities = mockDataSource.entityMetadatas;
        entities.map(async(entity) => await mockDataSource.getRepository(entity.name).remove({
            entity : entity
        }));
    },
};

export default mockConnection;