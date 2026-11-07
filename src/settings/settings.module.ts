import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationEntity } from './integration.entity';
import { ScenarioEntity } from './scenario.entity';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { SystemSettingsEntity } from './system-settings.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemSettingsEntity,
      IntegrationEntity,
      ScenarioEntity,
    ]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
