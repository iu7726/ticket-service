import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Inject, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Logger } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { ClsService } from 'nestjs-cls';

@Processor('stock-queue')
export class StockExpirationProcessor extends WorkerHost implements OnModuleInit  {
  private readonly logger = new Logger(StockExpirationProcessor.name);
  private restoreStockScript: string;

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis, private readonly cls: ClsService) {
    super();
  }

  onModuleInit() {
    const scriptPath = path.join(process.cwd(), 'src/redis/lua/restoreStock.lua');
    this.restoreStockScript = fs.readFileSync(scriptPath, 'utf8');
  }

  async process(job: Job) {
    const { productId, reservationKey, traceId } = job.data;

    this.cls.runWith({ traceId: traceId || '' }, async () => {

      this.logger.debug(`🔍 Checking expiration for ${reservationKey}...`);
  
      // 1. Redis에 예약 키가 아직 살아있는지 확인
      const exists = await this.redis.exists(reservationKey);
  
      if (exists) {
        // 🚨 살아있다 = 5분 지났는데 결제 안 함 (구매 포기)
        // -> 재고 복구 + 키 삭제
        
        const stockKey = `product:${productId}:stock`;
  
        await this.redis.eval(this.restoreStockScript, 2, stockKey, reservationKey);
  
        this.logger.warn(`♻️ Expired! Stock restored for Product ${productId}`);
      } else {
        // ✅ 없다 = 이미 결제해서 confirm에서 지웠음 (정상)
        this.logger.debug(`✅ Already confirmed or handled.`);
      }
      
    })

  }
}