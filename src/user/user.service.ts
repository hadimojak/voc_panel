import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private repo: Repository<UserEntity>,
  ) {}

  findByUsername(username: string) {
    return this.repo.findOne({ where: { username } });
  }

  findById(id: number) {
    return this.repo.findOne({ where: { id } });
  }

  create(data: Partial<UserEntity>) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  updateRefreshToken(userId: number, token: string | null) {
    return this.repo.update(userId, { refreshToken: token });
  }
}
