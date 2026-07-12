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

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: TicketEntity[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.ticketRepo.findAndCount({
      skip: skip,
      take: limit,
      order: {
        createdtime: 'DESC', // معمولاً تیکت‌های جدیدتر در ابتدا نمایش داده می‌شوند
      },
    });

    return {
      data,
      total,
    };
  }
}
