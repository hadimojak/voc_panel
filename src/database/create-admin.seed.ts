import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from './data-source';
import { UserService } from '../user/user.service';
import { UserEntity, UserRole } from '../user/user.entity';
import { QueryRunner } from 'typeorm';

const seedUsers = [
  {
    fullName: 'مدیر سیستم',
    mobile: '09120000001',
    password: '123456',
    role: UserRole.admin,
    email: 'admin@example.com',
    team: 'HQ',
  },
  {
    fullName: 'علی رضایی',
    mobile: '09120000002',
    password: '123456',
    role: UserRole.supervisor,
    email: 'supervisor@example.com',
    team: 'ارزیابی جبران',
  },
  {
    fullName: 'سارا احمدی',
    mobile: '09120000003',
    password: '123456',
    role: UserRole.agent,
    email: 'agent@example.com',
    team: 'ارزیابی جبران',
  },
];

async function createAdmins() {
  let queryRunner: QueryRunner | null = null;

  try {
    await AppDataSource.initialize();

    queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const userService = new UserService(
      queryRunner.manager.getRepository(UserEntity),
    );

    for (const seed of seedUsers) {
      const existingUser = await userService.findByMobile(seed.mobile);
      if (existingUser) {
        console.log(`User "${seed.mobile}" already exists, skipping`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(seed.password, 10);
      await userService.create({
        fullName: seed.fullName,
        mobile: seed.mobile,
        password: hashedPassword,
        role: seed.role,
        email: seed.email,
        team: seed.team,
        active: true,
      });
      console.log(
        `User "${seed.fullName}" (${seed.role}) created: ${seed.mobile}`,
      );
    }

    await queryRunner.commitTransaction();
    console.log('Transaction committed successfully.');

    await queryRunner.release();
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Admin seed failed');
    console.error(error);

    if (queryRunner) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      console.log('Transaction rolled back.');
    }

    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

createAdmins();
