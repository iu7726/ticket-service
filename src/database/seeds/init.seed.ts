import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { User } from 'src/common/entities/user.entity';
import { Product } from 'src/common/entities/products.entity';

async function bootstrap() {
  const logger = new Logger('Seed');
  
  const app = await NestFactory.createApplicationContext(AppModule);
  
  // 연결된 DB 정보 사용
  const dataSource = app.get(DataSource);
  const userRepository = dataSource.getRepository(User);
  const productRepository = dataSource.getRepository(Product);

  logger.log('🌱 Seeding started...');

  try {
    // ---------------------------------------------------
    // 1️⃣ 상품(Product) 데이터 생성 - "아이유 콘서트"
    // ---------------------------------------------------
    const productName = '아이유 2025 월드 투어 : H.E.R';
    const existingProduct = await productRepository.findOneBy({ name: productName });

    if (!existingProduct) {
      await productRepository.save({
        name: productName,
        description: '상암 월드컵 경기장 VIP석',
        price: 150000, // 15만원
        stock: 100,    // 🎯 핵심: 재고 100개 (품절 테스트용)
      });
      logger.log(`✅ Product created: ${productName} (Stock: 100)`);
    } else {
      logger.log(`ℹ️ Product already exists: ${productName}`);
    }

    // ---------------------------------------------------
    // 2️⃣ 사용자(User) 데이터 생성 - 테스트 유저 10명
    // ---------------------------------------------------
    const usersToCreate: Partial<User>[] = [];
    for (let i = 1; i <= 10; i++) {
      const email = `user${i}@example.com`;
      const exists = await userRepository.findOneBy({ email });
      
      if (!exists) {
        usersToCreate.push({
          email,
          username: `Tester${i}`
        });
      }
    }

    if (usersToCreate.length > 0) {
      await userRepository.save(usersToCreate);
      logger.log(`✅ Created ${usersToCreate.length} test users.`);
    } else {
      logger.log(`ℹ️ Test users already exist.`);
    }

    logger.log('🌱 Seeding completed successfully.');
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
  } finally {
    // 3. 앱 종료 (DB 연결 해제)
    await app.close();
  }
}

bootstrap();