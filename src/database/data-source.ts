import 'dotenv/config';
import { DataSource } from 'typeorm';
import { TicketEntity } from '../ticket/ticket.entity';
import { ConfigService } from '../config/config.service';
import { UserEntity } from '../user/user.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: ConfigService.config.postgress.POSTGRES_HOST,
  port: ConfigService.config.postgress.POSTGRES_PORT,
  username: ConfigService.config.postgress.POSTGRES_USER,
  password: ConfigService.config.postgress.POSTGRES_PASSWORD,
  database: ConfigService.config.postgress.POSTGRES_DB,
  entities: [TicketEntity, UserEntity],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
