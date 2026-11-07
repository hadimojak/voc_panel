import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CallController } from './call.controller';
import { CallEntity } from './call.entity';
import { CallService } from './call.service';

@Module({
  imports: [TypeOrmModule.forFeature([CallEntity])],
  controllers: [CallController],
  providers: [CallService],
  exports: [CallService],
})
export class CallModule {}
