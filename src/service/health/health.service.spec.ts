import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { DataSource } from 'typeorm';

describe('HealthService', () => {
  let service: HealthService;
  let dataSource: any;
  let redisClient: any;

  beforeEach(async () => {
    jest.useFakeTimers();

    dataSource = {
      query: jest.fn(),
    };

    redisClient = {
      ping: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: DataSource, useValue: dataSource },
        { provide: 'REDIS_CLIENT', useValue: redisClient },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should mark DB and Redis as alive when they respond correctly', async () => {
      dataSource.query.mockResolvedValue([{ 1: 1 }]);
      redisClient.ping.mockResolvedValue('PONG');

      await service.checkHealth();

      const status = service.getHealthStatus();
      expect(status.isDbAlive).toBe(true);
      expect(status.isRedisAlive).toBe(true);
      expect(service.isHealthy()).toBe(true);
    });

    it('should mark DB as dead if query fails', async () => {
      dataSource.query.mockRejectedValue(new Error('DB connection error'));
      redisClient.ping.mockResolvedValue('PONG');

      await service.checkHealth();

      const status = service.getHealthStatus();
      expect(status.isDbAlive).toBe(false);
      expect(status.isRedisAlive).toBe(true);
      expect(service.isHealthy()).toBe(false);
    });

    it('should mark Redis as dead if ping fails', async () => {
      dataSource.query.mockResolvedValue([{ 1: 1 }]);
      redisClient.ping.mockRejectedValue(new Error('Redis connection error'));

      await service.checkHealth();

      const status = service.getHealthStatus();
      expect(status.isDbAlive).toBe(true);
      expect(status.isRedisAlive).toBe(false);
      expect(service.isHealthy()).toBe(false);
    });

    it('should handle timeout correctly', async () => {
      //지연 응답
      dataSource.query.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 2000)));
      redisClient.ping.mockResolvedValue('PONG');
      
      const checkPromise = service.checkHealth();
      
      // 시간 이동
      jest.advanceTimersByTime(1500);
      
      await checkPromise;

      const status = service.getHealthStatus();
      expect(status.isDbAlive).toBe(false);
      expect(status.isRedisAlive).toBe(true);
    });
  });

  describe('Lifecycle & Interval', () => {
    it('should start interval on module init', () => {
      const spy = jest.spyOn(service, 'checkHealth');
      service.onModuleInit();
      
      jest.advanceTimersByTime(3000);
      expect(spy).toHaveBeenCalled();
    });

    it('should stop interval on module destroy', () => {
      const spy = jest.spyOn(global, 'clearInterval');
      service.onModuleInit();
      service.onModuleDestroy();
      expect(spy).toHaveBeenCalled();
    });
  });
});
