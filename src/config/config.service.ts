import { Injectable } from '@nestjs/common';
import { config, AppConfig } from './config.constant';

@Injectable()
export class ConfigService {
  static readonly config: AppConfig = config;
}
