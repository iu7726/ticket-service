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
import { BullModule } from '@nestjs/bullmq';
import { BullMQConfigService } from './config/bullMQ.config';
import { QueueModule } from './service/queue/queue.module';
import { HealthServiceModule } from './service/health/health.module';
import { HealthModule } from './domain/health/health.module';

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

    BullModule.forRootAsync({
      useClass: BullMQConfigService,
    }),

    RedisModule,

    //domain
    PurchaseModule,
    HealthModule,
    AdminModule,

    // service modules
    UserServiceModule,
    ProductServiceModule,
    OrderServiceModule,
    QueueModule,
    HealthServiceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
