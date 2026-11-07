import 'dotenv/config';
import { DataSource } from 'typeorm';
import { TicketEntity } from '../ticket/ticket.entity';
import { ConfigService } from '../config/config.service';
import { UserEntity } from '../user/user.entity';
import { CrmSyncCursorEntity } from '../crm/crm-sync-cursor.entity';
import { SystemSettingsEntity } from '../settings/system-settings.entity';
import { IntegrationEntity } from '../settings/integration.entity';
import { ScenarioEntity } from '../settings/scenario.entity';
import { CallEntity } from '../call/call.entity';
import { CustomerEntity } from '../customer/customer.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: ConfigService.config.postgress.POSTGRES_HOST,
  port: ConfigService.config.postgress.POSTGRES_PORT,
  username: ConfigService.config.postgress.POSTGRES_USER,
  password: ConfigService.config.postgress.POSTGRES_PASSWORD,
  database: ConfigService.config.postgress.POSTGRES_DB,
  entities: [
    TicketEntity,
    UserEntity,
    CrmSyncCursorEntity,
    SystemSettingsEntity,
    IntegrationEntity,
    ScenarioEntity,
    CallEntity,
    CustomerEntity,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: ConfigService.config.postgress.synchronize,
  logging: false,
});
