import { Test, TestingModule } from '@nestjs/testing';
import { StockQueueService } from './stock-queue.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('StockQueueService', () => {
  let service: StockQueueService;
  let redis: any;
  let stockQueue: any;

  beforeEach(async () => {
    // Redis Mock
    redis = {
      multi: jest.fn().mockReturnThis(),
      del: jest.fn().mockReturnThis(),
      incr: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    // BullMQ Queue Mock
    stockQueue = {
      add: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockQueueService,
        { provide: 'REDIS_CLIENT', useValue: redis },
        { provide: getQueueToken('stock-queue'), useValue: stockQueue },
      ],
    }).compile();

    service = module.get<StockQueueService>(StockQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addJob', () => {
    const userId = 1;
    const productId = 1;
    const stockKey = 'stock-key';
    const reservationKey = 'res-key';

    it('should add job to queue successfully', async () => {
      stockQueue.add.mockResolvedValue({ id: 'job-id' });

      const result = await service.addJob(userId, productId, stockKey, reservationKey);

      expect(stockQueue.add).toHaveBeenCalled();
      expect(result).toBe(true);
      expect(redis.multi).not.toHaveBeenCalled();
    });

    it('should rollback redis logic if queue addition fails', async () => {
      // 1. Mock Queue Failure
      stockQueue.add.mockRejectedValue(new Error('Queue connection error'));

      // 2. Expect InternalServerError
      await expect(service.addJob(userId, productId, stockKey, reservationKey))
        .rejects
        .toThrow('일시적인 시스템 오류로 예약을 완료할 수 없습니다. 다시 시도해주세요.');

      // 3. Verify Rollback Execution
      expect(redis.multi).toHaveBeenCalled(); // Transaction Start
      expect(redis.del).toHaveBeenCalledWith(reservationKey); // Delete Reservation
      expect(redis.incr).toHaveBeenCalledWith(stockKey); // Restore Stock
      expect(redis.exec).toHaveBeenCalled(); // Execute Transaction
    });
  });
});
