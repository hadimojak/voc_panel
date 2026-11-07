import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from './permissions.decorator';
import { PermissionsGuard } from './permissions.guard';
import { RbacService } from './rbac.service';

@ApiTags('RBAC')
@Controller('rbac')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  @Get('permissions')
  @RequirePermissions('admin.manage')
  @ApiOperation({
    summary: 'Catalog of permissions (دسترسی‌ها matrix rows)',
  })
  @ApiResponse({ status: 200, description: 'Permission catalog' })
  listPermissions() {
    return this.rbacService.listPermissions();
  }

  @Get('roles')
  @RequirePermissions('admin.manage')
  @ApiOperation({
    summary: 'System roles with permissions (صفحه نقش‌ها و دسترسی‌ها)',
  })
  @ApiResponse({ status: 200, description: 'System role matrix' })
  listRoles() {
    return this.rbacService.listRoles();
  }
}
