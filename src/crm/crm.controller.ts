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
  @ApiOperation({ summary: 'CRM sync cursor / running status (admin.manage)' })
  getStatus() {
    return this.crmSyncService.getCursor();
  }

  @Post('sync')
  @ApiOperation({
    summary:
      'Fetch CRM tickets in chunks until has_more=false and upsert into tickets (admin.manage; requires company VPN)',
  })
  @ApiBody({ type: StartCrmSyncDto, required: false })
  @ApiResponse({ status: 201, description: 'Sync finished (or stopped on CRM error)' })
  @ApiResponse({ status: 409, description: 'Sync already running' })
  @ApiResponse({
    status: 503,
    description: 'CRM unreachable (connect to company VPN)',
  })
  sync(@Body() dto: StartCrmSyncDto) {
    return this.crmSyncService.syncUpdatedTickets({ reset: dto?.reset });
  }
}
