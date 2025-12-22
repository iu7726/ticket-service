import { Test, TestingModule } from '@nestjs/testing';
import { StockQueueService } from './stock-queue.service';

describe('QueueService', () => {
  let service: StockQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockQueueService],
    }).compile();

    service = module.get<StockQueueService>(StockQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
