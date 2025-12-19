import { Inject, Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import * as path from 'path';
import * as fs from 'fs';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { OrderService } from 'src/service/order/order.service';
import { ProductService } from 'src/service/product/product.service';

@Injectable()
export class PurchaseUseCase implements OnModuleInit {
  private readonly logger = new Logger(PurchaseUseCase.name);
  private purchaseScript: string;
  
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly dataSource: DataSource,
    private readonly orderService: OrderService,
    private readonly productService: ProductService
  ) {}

  async onModuleInit() {
    const scriptPath = path.join(process.cwd(), 'src/redis/lua/purchase.lua');
    this.purchaseScript = fs.readFileSync(scriptPath, 'utf8');
  }

  // 재고 선점 - 티켓 발행
  async reserve(userId: number, productId: number) {
    const stockKey = `product:${productId}:stock`;
    const reservationKey = `reservation:product:${productId}:user:${userId}`;
    const ttl = 300; // 5분

    const result = await this.redis.eval(this.purchaseScript, 2, stockKey, reservationKey, ttl.toString());

    if (result === -1) throw new Error('재고 없음');
    if (result === -2) throw new Error('이미 예약 잡으셨습니다.');

    const token = uuidv4();
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

      // 키 삭제
      await this.redis.del(reservationKey);

      // 재고 차감
      await this.productService.decrementStock(productId, 1, queryRunner.manager);
      
      await queryRunner.commitTransaction();
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
