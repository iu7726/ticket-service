import { Injectable } from '@nestjs/common';
import { HealthService } from 'src/service/health/health.service';

@Injectable()
export class HealthUseCase {
  constructor(
    private readonly healthService: HealthService,
  ) {}

  isHealthy() {
    return this.healthService.isHealthy();
  }

  getHealthStatus() {
    return this.healthService.getHealthStatus();
  }
}
