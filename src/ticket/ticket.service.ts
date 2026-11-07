import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TicketEntity } from './ticket.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';
import { normalizeOpenEnumValue } from '../common/types/open-enum';
import type { ListTicketsDto } from './dto/list-tickets.dto';
import {
  applyTicketFilters,
  applyTicketSort,
} from './ticket-query.builder';

const OPEN_ENUM_FIELDS = [
  'tickettype',
  'complaintstatus',
  'maincomplaint',
  'mainticket',
  'subticket',
  'reqtypeticket',
  'sentiment',
  'priority',
] as const;

export type TicketPage = {
  items: TicketEntity[];
  total: number;
  page: number;
  pageSize: number;
};

export type TicketFilterOptions = {
  types: string[];
  subjectPaths: Array<{ level1: string; level2: string; level3: string }>;
};

export type AdjacentTickets = {
  previousId: string | null;
  nextId: string | null;
};

@Injectable()
export class TicketService {
  constructor(
    @InjectRepository(TicketEntity)
    private readonly ticketRepo: Repository<TicketEntity>,
  ) {}

  async saveMany(tickets: Partial<TicketEntity>[]) {
    const normalized = tickets.map((ticket) => {
      const next: Partial<TicketEntity> = { ...ticket };
      for (const field of OPEN_ENUM_FIELDS) {
        if (next[field] !== undefined) {
          next[field] = normalizeOpenEnumValue(next[field]);
        }
      }
      return next;
    });
    await this.ticketRepo.upsert(normalized, ['ticketid']);
  }

  /**
   * Removes tickets whose activity is older than the cutoff
   * (uses modifiedtime, falls back to createdtime).
   */
  async deleteOlderThan(cutoff: Date): Promise<number> {
    const result = await this.ticketRepo
      .createQueryBuilder()
      .delete()
      .from(TicketEntity)
      .where(
        'COALESCE(modifiedtime, createdtime) IS NOT NULL AND COALESCE(modifiedtime, createdtime) < :cutoff',
        { cutoff },
      )
      .execute();

    return result.affected ?? 0;
  }

  async findLastTicket(): Promise<TicketEntity | null> {
    return await this.ticketRepo.findOne({
      order: { ticketid: 'DESC' },
    });
  }

  async list(query: ListTicketsDto): Promise<TicketPage> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const qb = this.ticketRepo.createQueryBuilder('ticket');
    applyTicketFilters(qb, query);
    applyTicketSort(qb, query.sort, query.dir);

    const [items, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return { items, total, page, pageSize };
  }

  /** @deprecated Prefer list() — kept for callers that only need page/limit. */
  async findAll(
    page: number,
    limit: number,
  ): Promise<{ data: TicketEntity[]; total: number }> {
    const result = await this.list({ page, pageSize: limit });
    return { data: result.items, total: result.total };
  }

  async findById(id: string): Promise<TicketEntity> {
    const ticket = await this.ticketRepo.findOne({ where: { ticketid: id } });
    if (!ticket) throw new NotFoundException('تیکتی یافت نشد.');
    return ticket;
  }

  async getFilterOptions(): Promise<TicketFilterOptions> {
    const typeRows = await this.ticketRepo
      .createQueryBuilder('ticket')
      .select('ticket.tickettype', 'tickettype')
      .distinct(true)
      .where("ticket.tickettype IS NOT NULL AND ticket.tickettype <> ''")
      .orderBy('ticket.tickettype', 'ASC')
      .getRawMany<{ tickettype: string }>();

    const types = [
      ...new Set(
        typeRows.map((row) =>
          row.tickettype === 'شکایات' ? 'شکایت' : row.tickettype,
        ),
      ),
    ].sort((a, b) => a.localeCompare(b, 'fa'));

    // Use `.distinct(true)` — putting DISTINCT inside select() breaks with addSelect.
    const pathRows = await this.ticketRepo
      .createQueryBuilder('ticket')
      .select(
        `COALESCE(NULLIF(ticket.maincomplaint, ''), ticket.mainticket)`,
        'level1',
      )
      .addSelect('ticket.subticket', 'level2')
      .addSelect('ticket.reqtypeticket', 'level3')
      .distinct(true)
      .where(
        `COALESCE(NULLIF(ticket.maincomplaint, ''), ticket.mainticket) IS NOT NULL
         AND COALESCE(NULLIF(ticket.maincomplaint, ''), ticket.mainticket) <> ''`,
      )
      .getRawMany<{ level1: string; level2: string | null; level3: string | null }>();

    const subjectPaths = pathRows
      .map((row) => ({
        level1: row.level1,
        level2: row.level2?.trim() || 'ندارد',
        level3: row.level3?.trim() || 'ندارد',
      }))
      .sort(
        (a, b) =>
          a.level1.localeCompare(b.level1, 'fa') ||
          a.level2.localeCompare(b.level2, 'fa') ||
          a.level3.localeCompare(b.level3, 'fa'),
      );

    return { types, subjectPaths };
  }

  async getAdjacent(
    id: string,
    query: ListTicketsDto,
  ): Promise<AdjacentTickets> {
    const qb = this.ticketRepo.createQueryBuilder('ticket');
    applyTicketFilters(qb, query);
    applyTicketSort(qb, query.sort, query.dir);
    qb.select('ticket.ticketid', 'ticketid');

    const rows = await qb.getRawMany<{ ticketid: string }>();
    const ids = rows.map((row) => String(row.ticketid));
    const index = ids.indexOf(String(id));
    if (index === -1) return { previousId: null, nextId: null };
    return {
      previousId: ids[index - 1] ?? null,
      nextId: ids[index + 1] ?? null,
    };
  }

  async exportToExcel(ticketIds: Array<string | number>): Promise<Buffer> {
    const normalizedTicketIds = ticketIds
      .map((ticketId) => String(ticketId).trim())
      .filter(Boolean);

    if (!normalizedTicketIds.length) {
      throw new BadRequestException(
        'شناسه تیکت‌ها برای خروجی اکسل الزامی است.',
      );
    }

    const tickets = await this.ticketRepo.find({
      where: { ticketid: In(normalizedTicketIds) },
    });

    if (!tickets.length) {
      throw new NotFoundException('تیکتی یافت نشد.');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tickets');

    worksheet.columns = [
      { header: 'Ticket ID', key: 'ticketid', width: 12 },
      { header: 'Ticket No', key: 'ticket_no', width: 15 },
      { header: 'National Code', key: 'nationalcode', width: 15 },
      { header: 'Account Name', key: 'accountname', width: 15 },
      { header: 'First Name', key: 'fname', width: 12 },
      { header: 'Last Name', key: 'lname', width: 12 },
      { header: 'Mobile', key: 'mobile', width: 15 },
      { header: 'Product Name', key: 'productname', width: 20 },
      { header: 'Branch Name', key: 'branchname', width: 15 },
      { header: 'Main Ticket', key: 'mainticket', width: 15 },
      { header: 'Sub Ticket', key: 'subticket', width: 15 },
      { header: 'Request Type', key: 'reqtypeticket', width: 15 },
      { header: 'Created Time', key: 'createdtime', width: 22 },
      { header: 'Modified Time', key: 'modifiedtime', width: 22 },
      { header: 'Ticket Type', key: 'tickettype', width: 12 },
      { header: 'Input Channel', key: 'inputchannel', width: 12 },
      { header: 'Complaint Text', key: 'complainttext', width: 30 },
      { header: 'Main Complaint', key: 'maincomplaint', width: 20 },
      { header: 'Status', key: 'complaintstatus', width: 12 },
      { header: 'Sentiment', key: 'sentiment', width: 12 },
      { header: 'Priority', key: 'priority', width: 12 },
      { header: 'Final Answer', key: 'finalanswer', width: 30 },
      { header: 'Closed Date', key: 'closeddate', width: 22 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Main Request', key: 'mainrequest', width: 20 },
      { header: 'Main Offer', key: 'mainoffer', width: 20 },
      { header: 'Owner Name', key: 'ownername', width: 25 },
    ];

    worksheet.views = [{ rightToLeft: true }];

    tickets.forEach((ticket) => {
      worksheet.addRow({
        ticketid: ticket.ticketid,
        ticket_no: ticket.ticket_no,
        nationalcode: ticket.nationalcode || '',
        accountname: ticket.accountname || '',
        fname: ticket.fname || '',
        lname: ticket.lname || '',
        mobile: ticket.mobile || '',
        productname: ticket.productname || '',
        branchname: ticket.branchname || '',
        mainticket: ticket.mainticket || '',
        subticket: ticket.subticket || '',
        reqtypeticket: ticket.reqtypeticket || '',
        createdtime: ticket.createdtime
          ? new Date(ticket.createdtime).toLocaleString('fa-IR')
          : '',
        modifiedtime: ticket.modifiedtime
          ? new Date(ticket.modifiedtime).toLocaleString('fa-IR')
          : '',
        tickettype: ticket.tickettype || '',
        inputchannel: ticket.inputchannel || '',
        complainttext: ticket.complainttext || '',
        maincomplaint: ticket.maincomplaint || '',
        complaintstatus: ticket.complaintstatus || '',
        sentiment: ticket.sentiment || '',
        priority: ticket.priority || '',
        finalanswer: ticket.finalanswer || '',
        closeddate: ticket.closeddate
          ? new Date(ticket.closeddate).toLocaleString('fa-IR')
          : '',
        description: ticket.description || '',
        mainrequest: ticket.mainrequest || '',
        mainoffer: ticket.mainoffer || '',
        ownername: ticket.ownername || '',
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { horizontal: 'center' };

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }
}
