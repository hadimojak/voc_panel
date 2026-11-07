import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '../config/config.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: ConfigService.config.postgress.POSTGRES_HOST,
      port: ConfigService.config.postgress.POSTGRES_PORT,
      username: ConfigService.config.postgress.POSTGRES_USER,
      password: ConfigService.config.postgress.POSTGRES_PASSWORD,
      database: ConfigService.config.postgress.POSTGRES_DB,
      autoLoadEntities: true,
      // Code-first: create/update tables from @Entity classes on connect.
      synchronize: ConfigService.config.postgress.synchronize,
      logging: false,
    }),
  ],
})
export class DatabaseModule {}
