import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Global() 
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        const redis = new Redis({
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          enableOfflineQueue: false,
          retryStrategy: (times) => {
            // 3번 재시도하고
            if (times > 3) {
              console.error(`[Redis] Retry limit reached. Giving up connection...`);
              return null;
            }
            console.log(`[Redis] Retrying connection... ${times}`);
            return Math.min(times * 50, 2000);
          },
        });
  
        redis.on('error', (err) => {
          console.error('[Redis] Error occurred:', err.message);
        });

        redis.on('end', () => {
          console.error('[Redis] Connection permanently closed (Failed).');
          // TODO: Slack or Discord alert
        });
        
        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['REDIS_CLIENT'], 
})
export class RedisModule {}