import { Body, Controller, Post } from '@nestjs/common';
import { PurchaseUseCase } from './purchase.use-case';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseUseCase: PurchaseUseCase) {}

  @Post('reserve')
  async reserve(@Body() body: { userId: number, productId: number }) {
    return this.purchaseUseCase.reserve(body.userId, body.productId);
  }

  @Post('confirm')
  async confirm(@Body() body: { userId: number, productId: number, token: string }) {
    return this.purchaseUseCase.confirm(body.userId, body.productId, body.token);
  }
}
