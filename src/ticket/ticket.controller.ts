import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { TicketService } from './ticket.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TicketEntity } from './ticket.entity';
import { ExportTicketsDto } from './dto/export-tickets.dto';

@Controller('ticket')
@ApiTags('Tickets')
export class TicketController {
  constructor(private ticketService: TicketService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get paginated tickets' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts from 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Return list of tickets with pagination metadata.',
  })
  async getTickets(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '60',
    @Req() req: any,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 60;

    const result = await this.ticketService.findAll(pageNumber, limitNumber);
    return {
      data: result.data,
      meta: {
        total: result.total,
        page: pageNumber,
        limit: limitNumber,
      },
    };
  }

  @Post('export')
  @UseGuards(JwtAuthGuard) // حفاظت از متد با توکن امنیتی JWT
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export selected tickets to Excel' })
  @ApiBody({ type: ExportTicketsDto })
  async exportTickets(
    @Body() exportDto: ExportTicketsDto,
    @Res() res: FastifyReply,
  ) {
    const buffer = await this.ticketService.exportToExcel(exportDto.ticketIds);

    // تنظیم هدرهای HTTP برای دانلود فایل اکسل در مرورگر
    res.header(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.header(
      'Content-Disposition',
      'attachment; filename="tickets_export.xlsx"',
    );
    res.header('Content-Length', `${buffer.length}`);

    return res.status(HttpStatus.OK).send(buffer);
  }
}
