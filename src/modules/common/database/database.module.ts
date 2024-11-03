import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import typeormDataSource from '../../../database/typeorm.data-source';

@Module({
  imports: [TypeOrmModule.forRoot(typeormDataSource.options)],
})
export class DatabaseModule {}
