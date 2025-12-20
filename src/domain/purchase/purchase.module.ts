import { Module } from '@nestjs/common';
import { PurchaseUseCase } from './purchase.use-case';
import { PurchaseController } from './purchase.controller';
import { OrderServiceModule } from 'src/service/order/order.service.module';
import { ProductServiceModule } from 'src/service/product/product.service.module';
import { BullModule } from '@nestjs/bullmq';
import { StockExpirationProcessor } from './stock-expiration.processor';

@Module({
  imports: [
    OrderServiceModule, 
    ProductServiceModule,
    BullModule.registerQueue({
      name: 'stock-queue',
    }),
  ],
  controllers: [PurchaseController],
  providers: [PurchaseUseCase, StockExpirationProcessor],
})
export class PurchaseModule {}
