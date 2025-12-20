import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Processor('stock-queue')
export class StockExpirationProcessor extends WorkerHost {
  private readonly logger = new Logger(StockExpirationProcessor.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {
    super();
  }

  async process(job: Job) {
    const { productId, reservationKey } = job.data;

    this.logger.debug(`🔍 Checking expiration for ${reservationKey}...`);

    // 1. Redis에 예약 키가 아직 살아있는지 확인
    const exists = await this.redis.exists(reservationKey);

    if (exists) {
      // 🚨 살아있다 = 5분 지났는데 결제 안 함 (구매 포기)
      // -> 재고 복구 + 키 삭제
      
      const stockKey = `product:${productId}:stock`;

      const scriptPath = path.join(process.cwd(), 'src/redis/lua/restoreStock.lua');
      const script = fs.readFileSync(scriptPath, 'utf8');

      await this.redis.eval(script, 2, stockKey, reservationKey);

      this.logger.warn(`♻️ Expired! Stock restored for Product ${productId}`);
    } else {
      // ✅ 없다 = 이미 결제해서 confirm에서 지웠음 (정상)
      this.logger.debug(`✅ Already confirmed or handled.`);
    }
  }
}