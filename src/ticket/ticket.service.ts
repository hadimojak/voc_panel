import { Injectable } from '@nestjs/common';
import { TicketEntity } from './ticket.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketRepo: Repository<TicketEntity>,
  ) {}

  async saveMany(tickets: Partial<TicketEntity>[]) {
    await this.ticketRepo.upsert(tickets, ['ticketid']);
  }

  async findLastTicket(): Promise<TicketEntity | null> {
    return await this.ticketRepo.findOne({
      order: { ticketid: 'DESC' },
    });
  }
}
