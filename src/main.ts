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

async function bootstrap() {
  const { port } = ConfigService.config.app;
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: "http://localhost:5173",
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('VOC Panel API')
    .setDescription('API documentation for VOC Panel')
    .setVersion('1.0')
    .addTag('tickets')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  try {
    const dataSource = app.get(DataSource);
    await dataSource.query('SELECT 1');

    console.log('db connected');
  } catch (error) {
    console.error('db connection failed');
    console.error(error);
    await app.close();
    process.exit(1);
  }

  await app.listen(port);
  Logger.verbose(`API running on http://localhost:${port}`);
}
bootstrap();
