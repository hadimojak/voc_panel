import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TicketService } from './ticket.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TicketEntity } from './ticket.entity';

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
}
