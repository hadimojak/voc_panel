import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  findByUsername(username: string) {
    return this.userRepo.findOne({ where: { username } });
  }

  findById(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }

  create(data: Partial<UserEntity>) {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }

  updateRefreshToken(userId: number, token: string | null) {
    return this.userRepo.update(userId, { refreshTokenHash: token });
  }
}
