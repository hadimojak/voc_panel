import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TicketEntity } from './ticket.entity';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as ExcelJS from 'exceljs';

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
      { header: 'Ticket Type', key: 'tickettype', width: 12 },
      { header: 'Complaint Text', key: 'complainttext', width: 30 },
      { header: 'Main Complaint', key: 'maincomplaint', width: 20 },
      { header: 'Status', key: 'complaintstatus', width: 12 },
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
        tickettype: ticket.tickettype || '',
        complainttext: ticket.complainttext || '',
        maincomplaint: ticket.maincomplaint || '',
        complaintstatus: ticket.complaintstatus || '',
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
