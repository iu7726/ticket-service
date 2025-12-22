import { Test, TestingModule } from '@nestjs/testing';
import { PurchaseUseCase } from './purchase.use-case';
import { DataSource } from 'typeorm';
import { OrderService } from 'src/service/order/order.service';
import { ProductService } from 'src/service/product/product.service';
import { StockQueueService } from 'src/service/queue/stock-queue.service';

describe('PurchaseUseCase', () => {
  let service: PurchaseUseCase;
  let redis: any;
  let dataSource: any;
  let orderService: any;
  let productService: any;
  let stockQueueService: any;

  // TypeORM의 QueryRunner를 모킹(Mocking)합니다.
  const mockQueryRunner = {
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
    manager: {},
  };

  beforeEach(async () => {
    mockQueryRunner.connect.mockClear();
    mockQueryRunner.startTransaction.mockClear();
    mockQueryRunner.commitTransaction.mockClear();
    mockQueryRunner.rollbackTransaction.mockClear();
    mockQueryRunner.release.mockClear();

    redis = {
      eval: jest.fn(),
      exists: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      pipeline: jest.fn(),
    };

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    };

    orderService = {
      createOrder: jest.fn(),
    };

    productService = {
      decrementStock: jest.fn(),
    };

    stockQueueService = {
      addJob: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseUseCase,
        { provide: 'REDIS_CLIENT', useValue: redis },
        { provide: DataSource, useValue: dataSource },
        { provide: OrderService, useValue: orderService },
        { provide: ProductService, useValue: productService },
        { provide: StockQueueService, useValue: stockQueueService },
      ],
    }).compile();

    service = module.get<PurchaseUseCase>(PurchaseUseCase);
    
    jest.spyOn(require('fs'), 'readFileSync').mockReturnValue('local script');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // reserve() 메서드 테스트 그룹
  describe('reserve', () => {
    it('should reserve stock successfully', async () => {
      redis.eval.mockResolvedValue(1); 

      const result = await service.reserve(1, 1);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('reservationId');
      expect(redis.eval).toHaveBeenCalled();
      expect(stockQueueService.addJob).toHaveBeenCalled(); 
    });

    it('should throw error if out of stock', async () => {
      redis.eval.mockResolvedValue(-1); 

      await expect(service.reserve(1, 1)).rejects.toThrow('재고 없음');
    });

    it('should throw error if already reserved', async () => {
      redis.eval.mockResolvedValue(-2); 

      await expect(service.reserve(1, 1)).rejects.toThrow('이미 예약 잡으셨습니다.');
    });
  });

  // confirm() 메서드 테스트 그룹
  describe('confirm', () => {
    const token = 'valid-uuid-token';
    const userId = 1;
    const productId = 1;
    const reservationKey = `reservation:product:${productId}:user:${userId}`;

    it('should confirm purchase successfully', async () => {
      redis.exists.mockResolvedValue(1);
      redis.get.mockResolvedValue(token);
      orderService.createOrder.mockResolvedValue({ id: 100 });
      
      const result = await service.confirm(userId, productId, token);

      // 1. 트랜잭션이 시작되었는가?
      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      
      // 2. 주문 생성과 재고 차감이 트랜잭션 내에서 실행되었는가?
      expect(orderService.createOrder).toHaveBeenCalled();
      expect(productService.decrementStock).toHaveBeenCalled();
      
      // 3. 성공 시 커밋이 호출되었는가?
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      
      // 4. Redis 예약 키가 삭제되었는가? (재고 복구 방지)
      expect(redis.del).toHaveBeenCalledWith(reservationKey);
      
      expect(result).toEqual({
        orderId: 100,
        quantity: 1,
        totalPrice: 150000,
      });
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid token', async () => {
      redis.exists.mockResolvedValue(1);
      redis.get.mockResolvedValue('wrong-token'); // 토큰 불일치 상황 연출

      await expect(service.confirm(userId, productId, token)).rejects.toThrow('유효하지 않은 토큰입니다.');
      // 유효성 검사 실패 시 트랜잭션은 시작조차 하면 안 됨
      expect(mockQueryRunner.startTransaction).not.toHaveBeenCalled();
    });

    it('should throw error if reservation does not exist', async () => {
      redis.exists.mockResolvedValue(0); // 예약 키 없음 -> 만료되었거나 예약 안 함

      await expect(service.confirm(userId, productId, token)).rejects.toThrow('예약 정보 없음');
    });

    it('should rollback transaction on failure', async () => {
      redis.exists.mockResolvedValue(1);
      redis.get.mockResolvedValue(token);
      
      // 주문 생성 중 DB 에러가 발생했다고 가정
      orderService.createOrder.mockRejectedValue(new Error('DB Error'));

      await expect(service.confirm(userId, productId, token)).rejects.toThrow('구매 처리에 실패했습니다.');
      
      // 에러 발생 시 커밋이 아닌 롤백이 호출되어야 함
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });
});
