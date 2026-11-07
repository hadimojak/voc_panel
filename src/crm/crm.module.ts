import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketModule } from '../ticket/ticket.module';
import { CrmSyncCursorEntity } from './crm-sync-cursor.entity';
import { CrmController } from './crm.controller';
import { CrmSyncService } from './crm-sync.service';

@Module({
  imports: [TypeOrmModule.forFeature([CrmSyncCursorEntity]), TicketModule],
  controllers: [CrmController],
  providers: [CrmSyncService],
  exports: [CrmSyncService],
})
export class CrmModule {}
