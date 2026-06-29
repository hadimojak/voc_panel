import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from 'src/config/config.service';

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
      synchronize: false,
    }),
  ],
})
export class DatabaseModule {}
