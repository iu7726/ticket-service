import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { DataSource } from 'typeorm';
import { HealthMonitor } from "@mh.js/health-monitor";

@Injectable()
export class HealthService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private dataSource: DataSource,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    @Inject('HEALTH_MONITOR') private readonly healthCheck: HealthMonitor,
  ) {}

  onModuleInit() {
    this.healthCheck.register({
      name: 'db',
      check: () => this.dataSource.query('SELECT /*+ MAX_EXECUTION_TIME(1000) */ 1'),
      timeout: 1000,
    });
    this.healthCheck.register({
      name: 'redis',
      check: () => this.redisClient.ping(),
      timeout: 1000,
    });
    this.healthCheck.start();
  }

  onModuleDestroy() {
    this.healthCheck.stop();
  }

  getHealthStatus() {
    const health = this.healthCheck.getStatus();

    return health;
  }

  isHealthy() {
    const health = this.healthCheck.getStatus();

    return health.status;
  }
}
