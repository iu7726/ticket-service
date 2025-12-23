import { Module } from '@nestjs/common';
import { ClsModule } from 'nestjs-cls';
import { CustomLogger } from './custom.logger';


@Module({
  imports: [
    ClsModule
  ],
  providers: [CustomLogger],
  exports: [CustomLogger]
})
export class CustomLoggerModule {}
