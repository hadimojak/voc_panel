import { Module } from '@nestjs/common';
import { CallModule } from '../call/call.module';
import { CustomerModule } from '../customer/customer.module';
import { TicketModule } from '../ticket/ticket.module';
import { CrmController } from './crm.controller';
import { CrmSyncService } from './crm-sync.service';

@Module({
  imports: [TicketModule, CallModule, CustomerModule],
  controllers: [CrmController],
  providers: [CrmSyncService],
  exports: [CrmSyncService],
})
export class CrmModule {}
