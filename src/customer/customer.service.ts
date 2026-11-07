import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from './customer.entity';
import type { ListCustomersDto } from './dto/list-customers.dto';

export type CustomerPage = {
  items: CustomerEntity[];
  total: number;
  page: number;
  pageSize: number;
};

export type CustomerOverview = {
  total: number;
  active: number;
  vip: number;
  corporate: number;
  withOpenTickets: number;
  atRisk: number;
  lastSentiment: { positive: number; neutral: number; negative: number };
};

const SORT_COLUMN: Record<string, string> = {
  fullName: 'customer.lname',
  lastInteractionAt: 'customer.lastinteractionat',
  openTicketCount: 'customer.openticketcount',
  activePolicyCount: 'customer.activepolicycount',
};

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepo: Repository<CustomerEntity>,
  ) {}

  async list(query: ListCustomersDto): Promise<CustomerPage> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const qb = this.customerRepo.createQueryBuilder('customer');

    const search = query.search?.trim();
    if (search) {
      const tokens = search.split(/\s+/).filter(Boolean);
      tokens.forEach((token, index) => {
        const key = `search${index}`;
        qb.andWhere(
          `(
            customer.nationalcode ILIKE :${key}
            OR customer.mobile ILIKE :${key}
            OR customer.fname ILIKE :${key}
            OR customer.lname ILIKE :${key}
            OR customer.accountname ILIKE :${key}
            OR CONCAT(COALESCE(customer.fname, ''), ' ', COALESCE(customer.lname, '')) ILIKE :${key}
          )`,
          { [key]: `%${token}%` },
        );
      });
    }

    if (query.status)
      qb.andWhere('customer.status = :status', { status: query.status });
    if (query.kind) qb.andWhere('customer.kind = :kind', { kind: query.kind });
    if (query.vipOnly) qb.andWhere('customer.isvip = true');

    const sortCol =
      SORT_COLUMN[query.sort ?? 'lastInteractionAt'] ??
      SORT_COLUMN.lastInteractionAt;
    const dir = (query.dir ?? 'desc').toUpperCase() as 'ASC' | 'DESC';
    qb.orderBy(sortCol, dir).addOrderBy('customer.nationalcode', dir);

    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total, page, pageSize };
  }

  async getOverview(): Promise<CustomerOverview> {
    const rows = await this.customerRepo.find();
    const lastSentiment = { positive: 0, neutral: 0, negative: 0 };
    for (const row of rows) {
      if (row.lastsentiment === 'positive') lastSentiment.positive += 1;
      else if (row.lastsentiment === 'neutral') lastSentiment.neutral += 1;
      else if (row.lastsentiment === 'negative') lastSentiment.negative += 1;
    }

    return {
      total: rows.length,
      active: rows.filter((r) => r.status === 'active').length,
      vip: rows.filter((r) => r.isvip).length,
      corporate: rows.filter((r) => r.kind === 'corporate').length,
      withOpenTickets: rows.filter((r) => r.openticketcount > 0).length,
      atRisk: rows.filter((r) => r.lastsentiment === 'negative').length,
      lastSentiment,
    };
  }

  async findByNationalCode(nationalcode: string): Promise<CustomerEntity> {
    const customer = await this.customerRepo.findOne({
      where: { nationalcode },
    });
    if (!customer) throw new NotFoundException('مشتری یافت نشد.');
    return customer;
  }

  async upsertMany(customers: Partial<CustomerEntity>[]) {
    if (!customers.length) return;
    await this.customerRepo.upsert(customers as CustomerEntity[], [
      'nationalcode',
    ]);
  }
}
