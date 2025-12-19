import { Test, TestingModule } from '@nestjs/testing';
import { AdminUseCase } from './admin.use-case';

describe('AdminUseCase', () => {
  let service: AdminUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminUseCase],
    }).compile();

    service = module.get<AdminUseCase>(AdminUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
