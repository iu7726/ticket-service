import { Injectable } from "@nestjs/common";
import { EntityManager, Repository } from "typeorm";
import { Order } from "src/common/entities/order.entity";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class OrderService {
  private manager: EntityManager;

  constructor(
    @InjectRepository(Order) private readonly orderRepo: Repository<Order>
  ) {}

  /**
   * 주문 생성
   * @param orderData 주문 데이터
   * @param manager (선택) 트랜잭션 매니저. 없으면 기본 Repo 사용
   */
  async createOrder(order: Partial<Order>, manager?: EntityManager) {
    const repo = manager ? manager.getRepository(Order) : this.orderRepo;

    const newOrder = repo.create(order);

    if (newOrder.userId === null || newOrder.productId === null || newOrder.quantity === null || newOrder.totalPrice === null) {
      throw new Error('Invalid order data');
    }

    return repo.save(newOrder);
  }
}
