import { DataSource } from 'typeorm';
import databaseConfig from './database-config';
import { entitiesList } from '../utils/entity-list';

export const AppDataSource = new DataSource({
    ...databaseConfig,
    entities: entitiesList
});
