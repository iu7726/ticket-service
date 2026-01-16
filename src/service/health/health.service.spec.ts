import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { DataSource } from 'typeorm';

describe('HealthService', () => {
  let service: HealthService;
  let dataSource: Partial<DataSource>;
  let redisClient: any;
  let healthMonitorMock: any;

  beforeEach(async () => {
    dataSource = {
      query: jest.fn(),
    };

    redisClient = {
      ping: jest.fn(),
    };

    healthMonitorMock = {
      register: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      getStatus: jest.fn().mockReturnValue({ status: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: DataSource, useValue: dataSource },
        { provide: 'REDIS_CLIENT', useValue: redisClient },
        { provide: 'HEALTH_MONITOR', useValue: healthMonitorMock },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should register checks and start monitor', () => {
      service.onModuleInit();

      expect(healthMonitorMock.register).toHaveBeenCalledTimes(2);
      expect(healthMonitorMock.register).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'db' }),
      );
      expect(healthMonitorMock.register).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'redis' }),
      );
      expect(healthMonitorMock.start).toHaveBeenCalledTimes(1);
    });

    it('should configure db check correctly', async () => {
      service.onModuleInit();
      const dbCheckCall = healthMonitorMock.register.mock.calls.find(
        (call: any[]) => call[0].name === 'db',
      );
      const dbCheckFn = dbCheckCall[0].check;

      await dbCheckFn();
      expect(dataSource.query).toHaveBeenCalledWith(
        'SELECT /*+ MAX_EXECUTION_TIME(1000) */ 1',
      );
    });

    it('should configure redis check correctly', async () => {
      service.onModuleInit();
      const redisCheckCall = healthMonitorMock.register.mock.calls.find(
        (call: any[]) => call[0].name === 'redis',
      );
      const redisCheckFn = redisCheckCall[0].check;

      await redisCheckFn();
      expect(redisClient.ping).toHaveBeenCalled();
    });
  });

  describe('onModuleDestroy', () => {
    it('should stop monitor', () => {
      service.onModuleDestroy();
      expect(healthMonitorMock.stop).toHaveBeenCalledTimes(1);
    });
  });

  describe('getHealthStatus', () => {
    it('should return status from monitor', () => {
      const mockStatus = { status: true, details: {} };
      healthMonitorMock.getStatus.mockReturnValue(mockStatus);

      const result = service.getHealthStatus();
      expect(healthMonitorMock.getStatus).toHaveBeenCalled();
      expect(result).toBe(mockStatus);
    });
  });

  describe('isHealthy', () => {
    it('should return boolean status from monitor', () => {
      healthMonitorMock.getStatus.mockReturnValue({ status: true });
      expect(service.isHealthy()).toBe(true);

      healthMonitorMock.getStatus.mockReturnValue({ status: false });
      expect(service.isHealthy()).toBe(false);
    });
  });
});
