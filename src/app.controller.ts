import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import Redis from 'ioredis';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    private dataSource: DataSource,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  @Get('health')
  async health() {
    await this.redisClient.set('health_check', 'true', 'EX', 60);
    const redisResult = await this.redisClient.get('health_check');

    return {
      mysql: this.dataSource.isInitialized ? 'connected' : 'disconnected',
      redis: redisResult ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    }
  }
}
