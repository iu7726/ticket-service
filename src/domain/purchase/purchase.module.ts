import { Module } from '@nestjs/common';
import { PurchaseUseCase } from './purchase.use-case';
import { PurchaseController } from './purchase.controller';
import { OrderServiceModule } from 'src/service/order/order.service.module';
import { ProductServiceModule } from 'src/service/product/product.service.module';
import { StockExpirationProcessor } from './stock-expiration.processor';
import { QueueModule } from 'src/service/queue/queue.module';

@Module({
  imports: [
    OrderServiceModule, 
    ProductServiceModule,
    QueueModule
  ],
  controllers: [PurchaseController],
  providers: [PurchaseUseCase, StockExpirationProcessor],
})
export class PurchaseModule {}
