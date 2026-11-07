import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../rbac/permissions.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { CallService } from './call.service';
import { ListCallsDto } from './dto/list-calls.dto';

@ApiTags('Calls')
@Controller('call')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('calls.view')
@ApiBearerAuth()
export class CallController {
  constructor(private readonly callService: CallService) {}

  @Get()
  @ApiOperation({ summary: 'List calls (صفحه تماس‌ها)' })
  list(@Query() query: ListCallsDto) {
    return this.callService.list(query);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Call list KPI strip' })
  summarize(@Query() query: ListCallsDto) {
    return this.callService.summarize(query);
  }

  @Get('filter-options')
  @ApiOperation({ summary: 'Distinct agents and queues for filters' })
  filterOptions() {
    return this.callService.getFilterOptions();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one call by callid' })
  @ApiParam({ name: 'id', example: 'IC11170' })
  findOne(@Param('id') id: string) {
    return this.callService.findById(id);
  }
}
