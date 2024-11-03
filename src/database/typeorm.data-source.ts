import { config } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [join(__dirname, '../modules/**/*.entity.{ts,js}')],
  migrations: [join(__dirname, '../database/migrations/*.{ts,js}')],
  subscribers: [join(__dirname, '../modules/**/*.subscriber.{ts,js}')],
  synchronize: false,
});
