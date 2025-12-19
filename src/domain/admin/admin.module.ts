import { Module } from '@nestjs/common';
import { AdminUseCase } from './admin.use-case';
import { AdminController } from './admin.controller';
import { ProductServiceModule } from 'src/service/product/product.service.module';

@Module({
  imports: [ProductServiceModule],
  controllers: [AdminController],
  providers: [AdminUseCase],
})
export class AdminModule {}
