import { Module } from '@nestjs/common';
import { PurchaseUseCase } from './purchase.use-case';
import { PurchaseController } from './purchase.controller';
import { OrderServiceModule } from 'src/service/order/order.service.module';
import { ProductServiceModule } from 'src/service/product/product.service.module';

@Module({
  imports: [OrderServiceModule, ProductServiceModule],
  controllers: [PurchaseController],
  providers: [PurchaseUseCase],
})
export class PurchaseModule {}
