import { Module } from '@nestjs/common';

import { ENVModule } from './modules/common/env/env.module';

@Module({
  imports: [ENVModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
