import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from './config/config.service';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { TicketModule } from './ticket/ticket.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { CrmModule } from './crm/crm.module';
import { RbacModule } from './rbac/rbac.module';
import { SettingsModule } from './settings/settings.module';
import { CallModule } from './call/call.module';
import { CustomerModule } from './customer/customer.module';
import { SupersetController } from './superset/superset.controller';
import { SupersetService } from './superset/superset.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DatabaseModule,
    RedisModule,
    RabbitmqModule,
    TicketModule,
    AuthModule,
    UserModule,
    CrmModule,
    RbacModule,
    SettingsModule,
    CallModule,
    CustomerModule,
  ],
  controllers: [AppController, SupersetController],
  providers: [AppService, ConfigService, SupersetService],
})
export class AppModule {}
