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

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule, TicketModule, AuthModule, UserModule],
  controllers: [AppController],
  providers: [AppService, TaskService, ConfigService],
})
export class AppModule {}
