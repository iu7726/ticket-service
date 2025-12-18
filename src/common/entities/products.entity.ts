import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @Column('text', {nullable: true})
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int', { unsigned: true })
  stock: number;
}