import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthMonitor } from '@mh.js/health-monitor';

@Module({
  providers: [
    HealthService,
    {
      provide: 'HEALTH_MONITOR',
      useFactory: () => {
        return new HealthMonitor({
          interval: 3000,
          timeout: 1000,
        });
      },
    },
  ],
  exports: [HealthService],
})
export class HealthServiceModule {}
