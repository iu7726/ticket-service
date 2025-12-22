import { Test, TestingModule } from '@nestjs/testing';
import { HealthUseCase } from './health.use-case';

describe('HealthService', () => {
  let service: HealthUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthUseCase],
    }).compile();

    service = module.get<HealthUseCase>(HealthUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
