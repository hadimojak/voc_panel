import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../rbac/permissions.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { SupersetService } from './superset.service';

@ApiTags('Superset')
@Controller('superset')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class SupersetController {
  constructor(private readonly supersetService: SupersetService) {}

  @Post('guest-token')
  @RequirePermissions('dashboard.view')
  @ApiOperation({
    summary: 'Issue Superset guest token for embedded analytics (dashboard.view)',
  })
  async getGuestToken(@Body() body: { dashboardId: string }) {
    const token = await this.supersetService.getGuestToken(body.dashboardId);
    return { token };
  }
}
