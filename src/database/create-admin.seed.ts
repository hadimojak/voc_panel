import 'reflect-metadata';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from './data-source';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';

const admins = [
  { username: 'hadi', password: '123456' },
  { username: 'day', password: 'day123456' },
];

async function createAdmins() {
  try {
    await AppDataSource.initialize();

    const userService = new UserService(AppDataSource.getRepository(UserEntity));

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
      });
      console.log(`Admin "${admin.username}" created successfully`);
    }

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Admin seed failed');
    console.error(error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

createAdmins();
