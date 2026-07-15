import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from './data-source';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';
// 1. Import QueryRunner type
import { QueryRunner } from 'typeorm'; 

const admins = [
  { username: 'hadi', password: '123456', role: 0, email: 'test@gmail.com' },
  { username: 'day', password: 'day123456', role: 1, email: 'test1@gmail.com' },
];

async function createAdmins() {
  // 2. Explicitly type the variable
  let queryRunner: QueryRunner | null = null; 

  try {
    await AppDataSource.initialize();
    
    queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    // 3. Pass the repository from the transactional manager
    const userService = new UserService(
      queryRunner.manager.getRepository(UserEntity),
    );

    for (const admin of admins) {
      const existingUser = await userService.findByUsername(admin.username);
      if (existingUser) {
        console.log(`Admin "${admin.username}" already exists, skipping`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(admin.password, 10);
      await userService.create({
        username: admin.username,
        password: hashedPassword,
        role: admin.role,
        email: admin.email,
      });
      console.log(`Admin "${admin.username}" created successfully`);
    }

    await queryRunner.commitTransaction();
    console.log('Transaction committed successfully.');
    
    // Proper cleanup before exit
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
