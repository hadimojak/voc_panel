import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../rbac/permissions.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { CrmSyncService } from './crm-sync.service';
import { StartCrmSyncDto } from './dto/start-crm-sync.dto';

@ApiTags('CRM')
@Controller('crm')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('admin.manage')
@ApiBearerAuth()
export class CrmController {
  constructor(private readonly crmSyncService: CrmSyncService) {}

  @Get('sync/status')
  @ApiOperation({
    summary:
      'Ticket + call CRM sync cursors from root JSON file (admin.manage)',
  })
  getStatus() {
    return this.crmSyncService.getStatus();
  }

  @Post('sync/tickets')
  @ApiOperation({
    summary:
      'Start background job: fetch new tickets via voc_fetch_all until has_more=false (admin.manage; VPN)',
  })
  @ApiBody({ type: StartCrmSyncDto, required: false })
  @ApiResponse({ status: 201, description: 'Ticket sync job started' })
  @ApiResponse({ status: 409, description: 'Ticket sync already running' })
  @ApiResponse({
    status: 503,
    description: 'CRM unreachable (connect to company VPN)',
  })
  syncTickets(@Body() dto: StartCrmSyncDto) {
    return this.crmSyncService.startTicketsSync({ reset: dto?.reset });
  }

  @Post('sync/calls')
  @ApiOperation({
    summary:
      'Start background job: fetch new calls via voc_fetch_all_calls until has_more=false (admin.manage; VPN)',
  })
  @ApiBody({ type: StartCrmSyncDto, required: false })
  @ApiResponse({ status: 201, description: 'Call sync job started' })
  @ApiResponse({ status: 409, description: 'Call sync already running' })
  @ApiResponse({
    status: 503,
    description: 'CRM unreachable (connect to company VPN)',
  })
  syncCalls(@Body() dto: StartCrmSyncDto) {
    return this.crmSyncService.startCallsSync({ reset: dto?.reset });
  }
}
