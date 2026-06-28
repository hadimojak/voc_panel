import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketEntity } from './ticket.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TicketEntity])],
  providers: [TicketService],
  exports: [TicketService],
})
export class TicketModule {}
