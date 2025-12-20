import { BadRequestException, Inject, Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import * as path from 'path';
import * as fs from 'fs';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { OrderService } from 'src/service/order/order.service';
import { ProductService } from 'src/service/product/product.service';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class PurchaseUseCase implements OnModuleInit {
  private readonly logger = new Logger(PurchaseUseCase.name);
  private purchaseScript: string;
  
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly dataSource: DataSource,
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
    @InjectQueue('stock-queue') private stockQueue: Queue
  ) {}

  async onModuleInit() {
    const scriptPath = path.join(process.cwd(), 'src/redis/lua/purchase.lua');
    this.purchaseScript = fs.readFileSync(scriptPath, 'utf8');
  }

  // 재고 선점 - 티켓 발행
  async reserve(userId: number, productId: number) {
    const stockKey = `product:${productId}:stock`;
    const reservationKey = `reservation:product:${productId}:user:${userId}`;
    const ttl = 600; // 10분 - 실제 결제 시간은 5분
    const token = uuidv4();

    const result = await this.redis.eval(this.purchaseScript, 2, stockKey, reservationKey, ttl.toString(), token);

    if (result === -1) throw new Error('재고 없음');
    if (result === -2) throw new Error('이미 예약 잡으셨습니다.');

    await this.stockQueue.add(
      'check-expiration', // 작업 이름
      { 
        userId, 
        productId, 
        reservationKey 
      }, // 데이터
      { 
        delay: 5 * 60 * 1000, // 5분 지연 (300000ms)
        removeOnComplete: true, // 성공하면 로그 삭제 (Redis 용량 관리)
      }
    );

    this.logger.log(`User ${userId} reserved Product ${productId} with Token ${token}`);

    return {
      token,
      reservationId: reservationKey,
      expiresIn: ttl
    }
  }

  // 구매 확정
  async confirm(userId: number, productId: number, token: string) {
    const reservationKey = `reservation:product:${productId}:user:${userId}`;
    
    const exists = await this.redis.exists(reservationKey);
    if (!exists) throw new Error('예약 정보 없음');

    const savedToken = await this.redis.get(reservationKey);
    if (savedToken !== token) throw new BadRequestException('유효하지 않은 토큰입니다.');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 주문 생성
      const order = await this.orderService.createOrder({
        userId,
        productId,
        quantity: 1,
        totalPrice: 150000,
      }, queryRunner.manager)  

      // 재고 차감
      await this.productService.decrementStock(productId, 1, queryRunner.manager);
      
      await queryRunner.commitTransaction();

      // 키 삭제
      await this.redis.del(reservationKey);
      this.logger.log(`User ${userId} confirmed Product ${productId}, Order ID: ${order.id}`);
      
      return {
        orderId: order.id,
        quantity: 1,
        totalPrice: 150000
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`User ${userId} failed to confirm Product ${productId}`, error);
      throw new InternalServerErrorException('구매 처리에 실패했습니다.');
    } finally {
      await queryRunner.release();
    }
  }
}
