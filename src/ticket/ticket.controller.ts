import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../rbac/permissions.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { ExportTicketsDto } from './dto/export-tickets.dto';
import { ListTicketsDto } from './dto/list-tickets.dto';
import { TicketService } from './ticket.service';

@Controller('ticket')
@ApiTags('Tickets')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('tickets.view')
@ApiBearerAuth()
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  @ApiOperation({
    summary: 'List tickets with filters/sort/pagination (صفحه تیکت‌ها)',
  })
  @ApiResponse({ status: 200, description: 'Paginated CRM tickets' })
  list(@Query() query: ListTicketsDto) {
    return this.ticketService.list(query);
  }

  @Get('filter-options')
  @ApiOperation({ summary: 'Distinct types + subject paths for column filters' })
  filterOptions() {
    return this.ticketService.getFilterOptions();
  }

  @Get('adjacent')
  @ApiOperation({ summary: 'Previous/next ticket ids inside the current filter' })
  adjacent(@Query() query: ListTicketsDto & { id: string }) {
    const { id, ...filter } = query;
    return this.ticketService.getAdjacent(String(id), filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one ticket by ticketid' })
  @ApiParam({ name: 'id', example: '8993822' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  findOne(@Param('id') id: string) {
    return this.ticketService.findById(id);
  }

  @Post('export')
  @ApiOperation({ summary: 'Export selected tickets to Excel (tickets.view)' })
  @ApiBody({ type: ExportTicketsDto })
  async exportTickets(
    @Body() exportDto: ExportTicketsDto,
    @Res() res: FastifyReply,
  ) {
    const buffer = await this.ticketService.exportToExcel(exportDto.ticketIds);

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
