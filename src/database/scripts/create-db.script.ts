import { parse } from 'pg-connection-string';
import { DataSource, DataSourceOptions } from 'typeorm';

import typeormDataSource from '../typeorm.data-source';

async function createDatabase() {
  const url = (typeormDataSource.options as any).url;

  const { database, password, user, port, host } = parse(url);

  const connection = new DataSource({
    type: typeormDataSource.options.type,
    host,
    port,
    username: user,
    password,
  } as DataSourceOptions);

  await connection.initialize();

  const result = await connection.query(`SELECT 1 FROM pg_database WHERE datname = '${database}'`);

  if (result.length === 0) {
    console.info(`Creating database "${database}"...`);

    await connection.query(`CREATE DATABASE "${database}"`);
  }

  console.info(`Database "${database}" is ready!`);

  await connection.destroy();
}

void createDatabase().catch((error) => console.error('Database not ready:', error));
