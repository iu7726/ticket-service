import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env-validation.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import { TypeOrmConfigService } from './config/typeorm.config';
import { UserServiceModule } from './service/user/user.service.module';
import { ProductServiceModule } from './service/product/product.service.module';
import { OrderServiceModule } from './service/order/order.service.module';
import { PurchaseModule } from './domain/purchase/purchase.module';
import { AdminModule } from './domain/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
      envFilePath: `.env`,
      validationSchema: envValidationSchema,
    }),

    // MySQL 연결 (TypeORM)
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),

    RedisModule,

    //domain
    PurchaseModule,
    AdminModule,

    // service modules
    UserServiceModule,
    ProductServiceModule,
    OrderServiceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
