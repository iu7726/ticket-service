import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';
import { ProductService } from 'src/service/product/product.service';
import { Not, IsNull } from 'typeorm';

@Injectable()
export class AdminUseCase {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly productService: ProductService
  ) {}

  // 재고 동기화
  async syncStock() {
    const products = await this.productService.getProductList({stock: Not(0)});
    
    if (!products || products.length === 0) throw new NotFoundException(`Products not found`);

    for (const product of products) {
      const stock = await this.redis.get(`product:${product.id}:stock`);
      if (Number(stock) !== product.stock) {
        await this.redis.set(`product:${product.id}:stock`, product.stock.toString());
      }
    }

    return true;
  }
}
