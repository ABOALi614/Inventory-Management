import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JobsModule } from '../jobs/jobs.module';
import { LedgerModule } from '../ledger/ledger.module';
import { StockMovementService } from './application/stock-movement.service';
import { StockMovementController } from './presentation/stock-movement.controller';

@Module({
  imports: [LedgerModule, AuthModule, JobsModule],
  controllers: [StockMovementController],
  providers: [StockMovementService],
  exports: [StockMovementService],
})
export class InventoryModule {}
