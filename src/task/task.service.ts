import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class TaskService {
  @Cron(CronExpression.EVERY_10_HOURS)
  handleCron() {
    // Intentionally quiet — only log failures if/when work is added here.
  }
}
