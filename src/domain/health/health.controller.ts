import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HealthUseCase } from './health.use-case';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthUseCase) {}

  @Get()
  isHealthy() {
    return this.healthService.isHealthy();
  }

  @Get("info")
  getHealthStatus() {
    return this.healthService.getHealthStatus();
  }

}
