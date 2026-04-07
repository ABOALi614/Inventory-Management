import { Module } from '@nestjs/common';
import { LedgerPostingService } from './application/ledger-posting.service';

@Module({
  providers: [LedgerPostingService],
  exports: [LedgerPostingService],
})
export class LedgerModule {}
