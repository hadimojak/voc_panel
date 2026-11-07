import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../rbac/permissions.decorator';
import { PermissionsGuard } from '../rbac/permissions.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { SetUserActiveDto } from './dto/set-user-active.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
@ApiTags('Users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('admin.manage')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: 'List staff users with pagination/filters (صفحه کاربران)',
  })
  @ApiResponse({ status: 200, description: 'Paginated users' })
  list(@Query() query: ListUsersDto) {
    return this.userService.list(query);
  }

  @Get('count-by-role')
  @ApiOperation({
    summary: 'Count active users per role (RolesPage meters)',
  })
  countByRole() {
    return this.userService.countByRole();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get staff user by id' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'User returned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create staff user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Mobile or email already exists' })
  create(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update staff user' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Mobile or email already exists' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.userService.updateUser(id, dto);
  }

  @Patch(':id/active')
  @ApiOperation({ summary: 'Activate / deactivate staff user' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: SetUserActiveDto })
  setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SetUserActiveDto,
  ) {
    return this.userService.setActive(id, dto.active);
  }

  @Patch(':id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateUserDto })
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateUser(id, { role: dto.role });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete staff user' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteUser(id);
  }
}
