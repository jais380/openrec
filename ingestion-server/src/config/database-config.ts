import { DataSourceOptions } from 'typeorm'
import { config } from 'dotenv';

config();

const {
    ENVIRONMENT,
    NODE_ENV,
    USE_SSL,
    SSL_AUTHORIZE,
    DB_POOL_MAX
} = process.env;

const ENV = ENVIRONMENT?.toUpperCase() ?? NODE_ENV?.toUpperCase();

const {
    [`${ENV}_DB_HOST`]: host,
    [`${ENV}_DB_PORT`]: port,
    [`${ENV}_DB_NAME`]: database,
    [`${ENV}_DB_USERNAME`]: username,
    [`${ENV}_DB_PASSWORD`]: password,
} = process.env;

const parsedPoolMax = DB_POOL_MAX !== undefined ? parseInt(DB_POOL_MAX, 10) : NaN;
const poolMax = Number.isNaN(parsedPoolMax) ? 5 : Math.max(1, parsedPoolMax);

const isProd = ENV === "PRODUCTION" ? true : false;

const databaseConfig: DataSourceOptions = {
    host,
    port: Number(port),
    database,
    username,
    password,
    synchronize: false,
    type: "postgres",
    poolSize: poolMax,
    extra: {
        ...(
            USE_SSL === 'true'
            ? {
                ssl: {
                    rejectUnauthorized: SSL_AUTHORIZE === 'true' ? true : false
                }
            }
            : {}
        ),
        max: poolMax,
        min: 1,
        idleTimeoutMillis: 30000,
    },
    entities: [ isProd ? 'dist/entities/*.js' : 'src/entities/*{js,ts}'],
    migrations: [ isProd ? 'dist/migrations/*.js' : 'src/entities/*{js,ts}' ]
}

export default databaseConfig;
