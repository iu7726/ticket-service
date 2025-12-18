import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env-validation.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import { TypeOrmConfigService } from './config/typeorm.config';
import { UserModule } from './service/user/user.module';
import { ProductModule } from './service/product/product.module';

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

    // service modules
    UserModule,

    ProductModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
