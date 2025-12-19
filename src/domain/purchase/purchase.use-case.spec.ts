import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseUseCase } from './purchase.use-case';

describe('PurchaseService', () => {
  let service: PurchaseUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PurchaseUseCase],
    }).compile();

    service = module.get<PurchaseUseCase>(PurchaseUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
