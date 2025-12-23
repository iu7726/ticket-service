import { InjectQueue } from '@nestjs/bullmq';
import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class StockQueueService {
  private readonly logger = new Logger(StockQueueService.name);

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @InjectQueue('stock-queue') private stockQueue: Queue,
    private readonly cls: ClsService,
  ) {}

  async addJob(userId: number, productId: number, stockKey:string, reservationKey: string) {
    try {

      await this.stockQueue.add(
        'check-expiration', // 작업 이름
        { 
          userId, 
          productId, 
          reservationKey,
          traceId: this.cls.getId(),
        }, // 데이터
        { 
          delay: 5 * 60 * 1000, // 5분 지연 (300000ms)
          removeOnComplete: true, // 성공하면 로그 삭제 (Redis 용량 관리)
        }
      );
    } catch (error) {
      // 큐 등록 실패 시 롤백 (재고 복구 및 예약 삭제)
      this.logger.error(`Failed to add job to queue for User ${userId}, Product ${productId}. Rolling back...`, error);
      
      // 수동 롤백: 예약 키 삭제 및 재고 원복
      const transaction = this.redis.multi();
      transaction.del(reservationKey);
      transaction.incr(stockKey);
      await transaction.exec();

      throw new InternalServerErrorException('일시적인 시스템 오류로 예약을 완료할 수 없습니다. 다시 시도해주세요.');
    }

    return true;
  }
}
