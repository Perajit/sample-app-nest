import databaseConfig from 'src/config/database.config';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';

const rootDir = path.join(__dirname, '.');

const configOptions = databaseConfig();

export default new DataSource({
  type: configOptions.type,
  host: configOptions.host,
  port: configOptions.port,
  username: configOptions.username,
  password: configOptions.password,
  database: configOptions.database,
  synchronize: false,
  logging: configOptions.logging,
  entities: configOptions.entities,
  migrations: [path.join(rootDir, '/migrations/*{.ts,.js}')],
  seeds: [path.join(rootDir, '/seeds/**/*.seeder{.ts,.js}')],
} as DataSourceOptions);
