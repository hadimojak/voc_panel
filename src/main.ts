import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ConfigService } from './config/config.service';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { ensureDatabaseExists } from './database/ensure-database';

async function bootstrap() {
  const { port } = ConfigService.config.app;

  // Ensure DB exists, then TypeORM synchronize creates missing tables from entities.
  await ensureDatabaseExists();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { logger: ['error', 'warn', 'fatal'] },
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:5002',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  const config = new DocumentBuilder()
    .setTitle('VOC Panel API')
    .setDescription('API documentation for VOC Panel')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('tickets')
    .addTag('Auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  try {
    const dataSource = app.get(DataSource);
    await dataSource.query('SELECT 1');
  } catch (error) {
    Logger.error('Postgres connection failed', error);
    await app.close();
    process.exit(1);
  }

  await app.listen(port);
  Logger.warn(`API running on http://localhost:${port}`);
}
void bootstrap();
