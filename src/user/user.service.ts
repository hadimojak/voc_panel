import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

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

  async create(data: Partial<UserEntity>) {
    const user = this.userRepo.create(data);
    return await this.userRepo.save(user);
  }

  async updateRefreshToken(userId: number, hash: string | null) {
    console.log({ hash });

    return await this.userRepo.update(userId, { refreshTokenHash: hash });
  }

  async revokeTokens(userId: number) {
    await this.userRepo.increment({ id: userId }, 'tokenVersion', 1);
    return await this.updateRefreshToken(userId, null);
  }

  async updateUserProfile(userId: number, payload) {}
}
