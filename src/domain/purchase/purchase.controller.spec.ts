import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseController } from './purchase.controller';
import { PurchaseUseCase } from './purchase.use-case';

describe('PurchaseController', () => {
  let controller: PurchaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchaseController],
      providers: [PurchaseUseCase],
    }).compile();

    controller = module.get<PurchaseController>(PurchaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
