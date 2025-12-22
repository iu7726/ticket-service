import { Module } from '@nestjs/common';
import { HealthUseCase } from './health.use-case';
import { HealthController } from './health.controller';
import { HealthServiceModule } from 'src/service/health/health.module';

@Module({
  imports: [HealthServiceModule],
  controllers: [HealthController],
  providers: [HealthUseCase],
})
export class HealthModule {}
