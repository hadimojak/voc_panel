import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { AuthUser } from '../auth/auth.types';
import { permissionsOf } from '../rbac/permission';

/** Staff user shape aligned with smart-dashboard StaffUser. */
export type SafeUser = {
  id: string;
  fullName: string;
  mobile: string;
  email?: string;
  role: UserRole;
  team: string;
  active: boolean;
  createdAt: Date;
  lastLoginAt?: Date;
};

/** Page shape aligned with smart-dashboard `Page<T>`. */
export type SafeUserPage = {
  items: SafeUser[];
  total: number;
  page: number;
  pageSize: number;
};

const DEFAULT_STAFF_PASSWORD = '123456';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}

  async findByMobile(mobile: string) {
    return await this.userRepo.findOne({ where: { mobile } });
  }

  async findById(id: number) {
    return await this.userRepo.findOne({ where: { id } });
  }

  async list(query: ListUsersDto): Promise<SafeUserPage> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Record<string, unknown>[] = [];

    const base: Record<string, unknown> = {};
    if (query.role !== undefined) base.role = query.role;
    if (query.active !== undefined) base.active = query.active;

    const search = query.search?.trim();
    if (search) {
      where.push(
        { ...base, fullName: ILike(`%${search}%`) },
        { ...base, mobile: ILike(`%${search}%`) },
        { ...base, email: ILike(`%${search}%`) },
      );
    } else if (Object.keys(base).length > 0) {
      where.push(base);
    }

    const [users, total] = await this.userRepo.findAndCount({
      where: where.length > 0 ? where : undefined,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: users.map((user) => this.toSafeUser(user)),
      total,
      page,
      pageSize,
    };
  }

  async findOne(id: number): Promise<SafeUser> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.toSafeUser(user);
  }

  async create(data: Partial<UserEntity>) {
    const user = this.userRepo.create(data);
    return await this.userRepo.save(user);
  }

  async createUser(dto: CreateUserDto): Promise<SafeUser> {
    await this.ensureMobileIsAvailable(dto.mobile);
    await this.ensureEmailIsAvailable(dto.email);

    const hashedPassword = await bcrypt.hash(
      dto.password?.trim() || DEFAULT_STAFF_PASSWORD,
      10,
    );
    const user = this.userRepo.create({
      fullName: dto.fullName.trim(),
      mobile: dto.mobile,
      email: dto.email?.trim() ? dto.email.trim() : null,
      role: dto.role ?? UserRole.agent,
      team: dto.team.trim(),
      active: dto.active ?? true,
      password: hashedPassword,
    });

    return this.toSafeUser(await this.userRepo.save(user));
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<SafeUser> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.fullName !== undefined) {
      user.fullName = dto.fullName.trim();
    }

    if (dto.mobile && dto.mobile !== user.mobile) {
      await this.ensureMobileIsAvailable(dto.mobile, id);
      user.mobile = dto.mobile;
    }

    if (dto.email !== undefined) {
      const nextEmail = dto.email.trim() ? dto.email.trim() : null;
      if (nextEmail !== user.email) {
        await this.ensureEmailIsAvailable(nextEmail ?? undefined, id);
        user.email = nextEmail;
      }
    }

    if (dto.role !== undefined) {
      user.role = dto.role;
    }

    if (dto.team !== undefined) {
      user.team = dto.team.trim();
    }

    if (dto.active !== undefined) {
      user.active = dto.active;
    }

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
      user.refreshTokenHash = null;
      user.tokenVersion += 1;
    }

    return this.toSafeUser(await this.userRepo.save(user));
  }

  async setActive(id: number, active: boolean): Promise<SafeUser> {
    return this.updateUser(id, { active });
  }

  /** Active users only — matches RolesPage `countByRole`. */
  async countByRole(): Promise<Record<UserRole, number>> {
    const rows = await this.userRepo
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .where('user.active = :active', { active: true })
      .groupBy('user.role')
      .getRawMany<{ role: UserRole; count: string }>();

    const counts: Record<UserRole, number> = {
      [UserRole.agent]: 0,
      [UserRole.supervisor]: 0,
      [UserRole.admin]: 0,
    };

    for (const row of rows) {
      counts[row.role] = Number(row.count) || 0;
    }

    return counts;
  }

  async deleteUser(id: number) {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepo.delete(id);

    return { message: 'User deleted successfully' };
  }

  async updateRefreshToken(userId: number, hash: string | null) {
    return await this.userRepo.update(userId, { refreshTokenHash: hash });
  }

  async revokeTokens(userId: number) {
    await this.userRepo.increment({ id: userId }, 'tokenVersion', 1);
    return await this.updateRefreshToken(userId, null);
  }

  async touchLastLogin(userId: number) {
    await this.userRepo.update(userId, { lastLoginAt: new Date() });
  }

  async updateUserProfile(userId: number, payload: UpdateUserDto) {
    return this.updateUser(userId, payload);
  }

  toAuthUser(user: UserEntity): AuthUser {
    return {
      id: String(user.id),
      fullName: user.fullName,
      mobile: user.mobile,
      role: user.role,
      permissions: [...permissionsOf(user.role)],
    };
  }

  private async ensureMobileIsAvailable(
    mobile: string,
    currentUserId?: number,
  ) {
    const user = await this.findByMobile(mobile);

    if (user && user.id !== currentUserId) {
      throw new ConflictException('Mobile already exists');
    }
  }

  private async ensureEmailIsAvailable(email?: string, currentUserId?: number) {
    if (!email) {
      return;
    }

    const user = await this.userRepo.findOne({ where: { email } });

    if (user && user.id !== currentUserId) {
      throw new ConflictException('Email already exists');
    }
  }

  private toSafeUser(user: UserEntity): SafeUser {
    return {
      id: String(user.id),
      fullName: user.fullName,
      mobile: user.mobile,
      email: user.email ?? undefined,
      role: user.role,
      team: user.team,
      active: user.active,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt ?? undefined,
    };
  }
}
