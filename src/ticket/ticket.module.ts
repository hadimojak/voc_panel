import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketEntity } from './ticket.entity';
import { TicketController } from './ticket.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TicketEntity])],
  providers: [TicketService],
  exports: [TicketService],
  controllers: [TicketController],
})
export class TicketModule {}
