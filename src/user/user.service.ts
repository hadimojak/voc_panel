import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export type SafeUser = Omit<
  UserEntity,
  | 'password'
  | 'refreshTokenHash'
  | 'passwordResetToken'
  | 'passwordResetExpiresAt'
>;

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
  ) {}

  async findByUsername(username: string) {
    return await this.userRepo.findOne({ where: { username } });
  }

  async findById(id: number) {
    return await this.userRepo.findOne({ where: { id } });
  }

  async findAll(): Promise<SafeUser[]> {
    const users = await this.userRepo.find({
      order: { createdAt: 'DESC' },
    });

    return users.map((user) => this.toSafeUser(user));
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
    await this.ensureUsernameIsAvailable(dto.username);
    await this.ensureEmailIsAvailable(dto.email);

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      username: dto.username,
      email: dto.email,
      role: dto.role,
      password: hashedPassword,
    });

    return this.toSafeUser(await this.userRepo.save(user));
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<SafeUser> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.username && dto.username !== user.username) {
      await this.ensureUsernameIsAvailable(dto.username, id);
      user.username = dto.username;
    }

    if (dto.email !== undefined && dto.email !== user.email) {
      await this.ensureEmailIsAvailable(dto.email, id);
      user.email = dto.email;
    }

    if (dto.role !== undefined) {
      user.role = dto.role;
    }

    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
      user.refreshTokenHash = null;
      user.tokenVersion += 1;
    }

    return this.toSafeUser(await this.userRepo.save(user));
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
    console.log({ hash });

    return await this.userRepo.update(userId, { refreshTokenHash: hash });
  }

  async revokeTokens(userId: number) {
    await this.userRepo.increment({ id: userId }, 'tokenVersion', 1);
    return await this.updateRefreshToken(userId, null);
  }

  async updateUserProfile(userId: number, payload: UpdateUserDto) {
    return this.updateUser(userId, payload);
  }

  private async ensureUsernameIsAvailable(username: string, currentUserId?: number) {
    const user = await this.findByUsername(username);

    if (user && user.id !== currentUserId) {
      throw new ConflictException('Username already exists');
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
    const {
      password,
      refreshTokenHash,
      passwordResetToken,
      passwordResetExpiresAt,
      ...safeUser
    } = user;

    return safeUser;
  }
}
