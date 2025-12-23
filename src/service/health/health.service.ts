import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import Redis from 'ioredis';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService implements OnModuleInit, OnModuleDestroy {
  private isDbAlive = false;
  private isRedisAlive = false;
  private intervalId: NodeJS.Timeout;

  private lastCheckTime: number = 0;

  private readonly CHECK_INTERVAL = 3000;
  private readonly TIMEOUT_MS = 1000;

  constructor(
    private dataSource: DataSource,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  onModuleInit() {
    this.intervalId = setInterval(() => {
      this.checkHealth();
    }, this.CHECK_INTERVAL);
  }

  onModuleDestroy() {
    clearInterval(this.intervalId);
  }

  private rejectAfterTimeout(ms: number) {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    );
  }

  private checkTime() {
    const now = Date.now();
    const isState = (now - this.lastCheckTime) <= (this.CHECK_INTERVAL * 3);

    return isState;
  }

  async checkHealth() {
    const checkDB = Promise.race([
        this.dataSource.query('SELECT /*+ MAX_EXECUTION_TIME(1000) */ 1'),
        this.rejectAfterTimeout(this.TIMEOUT_MS)
      ]);

    const checkRedis = Promise.race([
      this.redisClient.ping(),
      this.rejectAfterTimeout(this.TIMEOUT_MS)
    ]);

    const [dbResult, redisResult] = await Promise.allSettled([checkDB, checkRedis]);

    if (dbResult.status === 'fulfilled') {
      this.isDbAlive = true;
    } else {
      this.isDbAlive = false;
    }

    if (redisResult.status === 'fulfilled') {
      this.isRedisAlive = true;
    } else {
      this.isRedisAlive = false;
    }

    this.lastCheckTime = Date.now();
  }

  getHealthStatus() {
    const isState = this.checkTime();

    return {
      isDbAlive: this.isDbAlive,
      isRedisAlive: this.isRedisAlive,
      isState,
    };
  }

  isHealthy() {
    const isState = this.checkTime();

    return isState && this.isDbAlive && this.isRedisAlive;
  }
}
