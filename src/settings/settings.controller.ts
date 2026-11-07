import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../rbac/permissions.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { CreateScenarioDto } from './dto/create-scenario.dto';
import { SetIntegrationEnabledDto } from './dto/set-integration-enabled.dto';
import { SetScenarioActiveDto } from './dto/set-scenario-active.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import type { IntegrationId } from './settings.enums';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('admin.manage')
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get system settings (تب عمومی)' })
  getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  @ApiOperation({ summary: 'Replace system settings (تب عمومی)' })
  @ApiBody({ type: UpdateSettingsDto })
  updateSettings(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(dto);
  }

  @Get('integrations')
  @ApiOperation({ summary: 'List integrations (تب یکپارچه‌سازی‌ها)' })
  getIntegrations() {
    return this.settingsService.getIntegrations();
  }

  @Post('integrations/:id/check')
  @ApiOperation({ summary: 'Health-check an integration' })
  @ApiParam({
    name: 'id',
    enum: ['crm', 'coreInsurance', 'callCenter', 'voices', 'ai'],
  })
  checkIntegration(@Param('id') id: IntegrationId) {
    return this.settingsService.checkIntegration(id);
  }

  @Patch('integrations/:id/enabled')
  @ApiOperation({ summary: 'Enable / disable an integration' })
  @ApiParam({
    name: 'id',
    enum: ['crm', 'coreInsurance', 'callCenter', 'voices', 'ai'],
  })
  @ApiBody({ type: SetIntegrationEnabledDto })
  setIntegrationEnabled(
    @Param('id') id: IntegrationId,
    @Body() dto: SetIntegrationEnabledDto,
  ) {
    return this.settingsService.setIntegrationEnabled(id, dto.enabled);
  }

  @Get('scenarios')
  @ApiOperation({ summary: 'List AI scenarios (تب سناریوها)' })
  getScenarios() {
    return this.settingsService.getScenarios();
  }

  @Post('scenarios')
  @ApiOperation({ summary: 'Create scenario' })
  @ApiBody({ type: CreateScenarioDto })
  createScenario(@Body() dto: CreateScenarioDto) {
    return this.settingsService.createScenario(dto);
  }

  @Patch('scenarios/:id/active')
  @ApiOperation({ summary: 'Activate / deactivate scenario' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiBody({ type: SetScenarioActiveDto })
  setScenarioActive(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SetScenarioActiveDto,
  ) {
    return this.settingsService.setScenarioActive(id, dto.active);
  }
}
