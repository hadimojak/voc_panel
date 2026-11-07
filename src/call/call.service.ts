import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallEntity } from './call.entity';
import type { ListCallsDto } from './dto/list-calls.dto';

export type CallPage = {
  items: CallEntity[];
  total: number;
  page: number;
  pageSize: number;
};

export type CallSummary = {
  total: number;
  answered: number;
  missed: number;
  live: number;
  avgWaitSec: number;
  avgTalkSec: number;
  negativeShare: number;
  uncategorized: number;
  aiAgreement: number;
};

export type CallFilterOptions = {
  agents: string[];
  queues: string[];
};

const SORT_COLUMN: Record<string, string> = {
  startedAt: 'call.createdtime',
  durationSec: 'call.durationsec',
  waitSec: 'call.waitsec',
  status: 'call.status',
  agent: 'call.ownername',
};

@Injectable()
export class CallService {
  constructor(
    @InjectRepository(CallEntity)
    private readonly callRepo: Repository<CallEntity>,
  ) {}

  async list(query: ListCallsDto): Promise<CallPage> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const qb = this.callRepo.createQueryBuilder('call');
    this.applyFilters(qb, query);

    const sortCol = SORT_COLUMN[query.sort ?? 'startedAt'] ?? SORT_COLUMN.startedAt;
    const dir = (query.dir ?? 'desc').toUpperCase() as 'ASC' | 'DESC';
    qb.orderBy(sortCol, dir).addOrderBy('call.callid', dir);

    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total, page, pageSize };
  }

  async summarize(query: ListCallsDto): Promise<CallSummary> {
    const qb = this.callRepo.createQueryBuilder('call');
    this.applyFilters(qb, query);
    const rows = await qb.getMany();

    const total = rows.length;
    const answered = rows.filter((c) => c.status === 'answered').length;
    const missed = rows.filter((c) => c.status === 'missed').length;
    const live = rows.filter(
      (c) => c.status === 'ringing' || c.status === 'ongoing',
    ).length;
    const waitSum = rows.reduce((s, c) => s + (c.waitsec ?? 0), 0);
    const talkSum = rows.reduce((s, c) => s + (c.durationsec ?? 0), 0);
    const analyzed = rows.filter((c) => c.sentiment);
    const negative = analyzed.filter((c) => c.sentiment === 'negative').length;

    return {
      total,
      answered,
      missed,
      live,
      avgWaitSec: total ? Math.round(waitSum / total) : 0,
      avgTalkSec: answered ? Math.round(talkSum / answered) : 0,
      negativeShare: analyzed.length ? negative / analyzed.length : 0,
      uncategorized: 0,
      aiAgreement: 0,
    };
  }

  async findById(id: string): Promise<CallEntity> {
    const call = await this.callRepo.findOne({ where: { callid: id } });
    if (!call) throw new NotFoundException('تماسی یافت نشد.');
    return call;
  }

  async getFilterOptions(): Promise<CallFilterOptions> {
    const agents = await this.callRepo
      .createQueryBuilder('call')
      .select('call.ownername', 'agent')
      .distinct(true)
      .where("call.ownername IS NOT NULL AND call.ownername <> ''")
      .orderBy('call.ownername', 'ASC')
      .getRawMany<{ agent: string }>();

    const queues = await this.callRepo
      .createQueryBuilder('call')
      .select('call.productname', 'queue')
      .distinct(true)
      .where("call.productname IS NOT NULL AND call.productname <> ''")
      .orderBy('call.productname', 'ASC')
      .getRawMany<{ queue: string }>();

    return {
      agents: agents.map((r) => r.agent),
      queues: queues.map((r) => r.queue),
    };
  }

  async upsertMany(calls: Partial<CallEntity>[]) {
    if (!calls.length) return;
    await this.callRepo.upsert(calls as CallEntity[], ['callid']);
  }

  private applyFilters(
    qb: ReturnType<Repository<CallEntity>['createQueryBuilder']>,
    query: ListCallsDto,
  ) {
    const search = query.search?.trim();
    if (search) {
      const tokens = search.split(/\s+/).filter(Boolean);
      tokens.forEach((token, index) => {
        const key = `search${index}`;
        qb.andWhere(
          `(
            call.callid ILIKE :${key}
            OR call.nationalcode ILIKE :${key}
            OR call.mobile ILIKE :${key}
            OR call.fname ILIKE :${key}
            OR call.lname ILIKE :${key}
            OR CONCAT(COALESCE(call.fname, ''), ' ', COALESCE(call.lname, '')) ILIKE :${key}
          )`,
          { [key]: `%${token}%` },
        );
      });
    }

    if (query.status) qb.andWhere('call.status = :status', { status: query.status });
    if (query.direction)
      qb.andWhere('call.direction = :direction', { direction: query.direction });
    if (query.agent) qb.andWhere('call.ownername = :agent', { agent: query.agent });
    if (query.queue)
      qb.andWhere('call.productname = :queue', { queue: query.queue });
    if (query.sentiment)
      qb.andWhere('call.sentiment = :sentiment', { sentiment: query.sentiment });
    if (query.from)
      qb.andWhere('call.createdtime >= :from', { from: new Date(query.from) });
    if (query.to)
      qb.andWhere('call.createdtime <= :to', { to: new Date(query.to) });
  }
}
