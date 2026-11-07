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
import { CustomerService } from './customer.service';
import { ListCustomersDto } from './dto/list-customers.dto';

@ApiTags('Customers')
@Controller('customer')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('customers.view')
@ApiBearerAuth()
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ApiOperation({ summary: 'List customers (صفحه مشتریان)' })
  list(@Query() query: ListCustomersDto) {
    return this.customerService.list(query);
  }

  @Get('overview')
  @ApiOperation({ summary: 'Customer list KPI strip' })
  overview() {
    return this.customerService.getOverview();
  }

  @Get(':nationalcode')
  @ApiOperation({ summary: 'Get customer profile by national code' })
  @ApiParam({ name: 'nationalcode', example: '0012345678' })
  findOne(@Param('nationalcode') nationalcode: string) {
    return this.customerService.findByNationalCode(nationalcode);
  }
}
