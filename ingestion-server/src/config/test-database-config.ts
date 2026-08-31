import { DataSourceOptions } from 'typeorm'
import { config } from 'dotenv';

config();

const { TEST_DB_URL, USE_SSL, SSL_AUTHORIZE } = process.env;

export const testDatabaseConfig: DataSourceOptions = {
    url: TEST_DB_URL,
    synchronize: true,
    type: 'postgres',
    extra: USE_SSL === 'true'
            ? {
                ssl: {
                    rejectUnauthorized: SSL_AUTHORIZE === 'true'
                                            ? 'true'
                                            : 'false'
                }
            }
            : {},
    entities: []
}
