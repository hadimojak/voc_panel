import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskService } from './task/task.service';
import { ConfigService } from './config/config.service';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseModule } from './database/database.module';
import { TicketModule } from './ticket/ticket.module';

@Module({
  imports: [ScheduleModule.forRoot(), DatabaseModule, TicketModule],
  controllers: [AppController],
  providers: [AppService, TaskService, ConfigService],
})
export class AppModule {}
