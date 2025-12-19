import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.entity";
import { Product } from "./products.entity";
import { BaseEntity } from "./base.entity";

@Entity('orders')
@Index(['userId', 'createdAt'])
export class Order extends BaseEntity{
  @ManyToOne(() => User, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id'})
  userId: number;

  @ManyToOne(() => Product, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Index()
  @Column({ name: 'product_id'})
  productId: number;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'total_price' })
  totalPrice: number;
}