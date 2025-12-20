import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SharedBullConfigurationFactory, BullRootModuleOptions } from '@nestjs/bullmq';

@Injectable()
export class BullMQConfigService implements SharedBullConfigurationFactory {
  constructor(private readonly configService: ConfigService) {}

  createSharedConfiguration(): BullRootModuleOptions {
    return {
      connection: {
        host: this.configService.get<string>('REDIS_HOST'),
        port: this.configService.get<number>('REDIS_PORT'),
      },

      defaultJobOptions: {
        removeOnComplete: true, // 완료된 작업 로그 자동 삭제
        removeOnFail: {
            count: 1000,
            age: 60 * 60 * 24 * 7 // 1주일
        },    // 실패한 작업은 남겨둠 (디버깅용)
        attempts: 3,            // 실패 시 3번 재시도
        backoff: {
          type: 'exponential',
          delay: 1000, // 1초부터 시작하여 2초, 4초...로 늘어남
        },
      },
    }
  }
}