import { Controller, Post } from '@nestjs/common';
import { AdminUseCase } from './admin.use-case';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminUseCase: AdminUseCase) {}

  @Post('sync-stock')
  syncStock() {
    return this.adminUseCase.syncStock();
  }
}
