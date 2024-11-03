import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['dist/src/modules/**/*.entity{.ts,.js}'],
  migrations: ['dist/src/common/database/migrations/*.{ts,js}'],
  subscribers: ['dist/src/modules/**/*.subscriber.{ts,js}'],
  synchronize: false,
});
