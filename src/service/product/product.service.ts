import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Product } from "src/common/entities/products.entity";
import { EntityManager, FindOptionsWhere, Repository } from "typeorm";

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>
  ) {}

  async decrementStock(productId: number, quantity: number = 1, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Product) : this.productRepo;

    const result = await repo.decrement({ id: productId }, 'stock', quantity);

    if (result.affected === 0) {
      throw new Error(`Product ${productId} not found or update failed`);
    }

    return result;
  }

  async getProduct(productId: number) {
    return this.productRepo.findOne({ where: { id: productId } });
  }

  async getProductList(search: FindOptionsWhere<Product> | FindOptionsWhere<Product>[]) {
    return this.productRepo.find({ where: search });
  }
}
