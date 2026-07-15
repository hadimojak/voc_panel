import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskService } from './task/task.service';
import { ConfigService } from './config/config.service';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { TicketModule } from './ticket/ticket.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SupersetController } from './superset/superset.controller';
import { SupersetService } from './superset/superset.service';

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule, TicketModule, AuthModule, UserModule],
  controllers: [AppController, SupersetController],
  providers: [AppService, TaskService, ConfigService, SupersetService],
})
export class AppModule {}
