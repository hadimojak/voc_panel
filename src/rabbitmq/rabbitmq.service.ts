import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import { ConfigService } from '../config/config.service';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private connection!: amqp.ChannelModel;
  private channel!: amqp.Channel;

  async onModuleInit() {
    const {
      RABBITMQ_HOST,
      RABBITMQ_PORT,
      RABBITMQ_USER,
      RABBITMQ_PASSWORD,
      RABBITMQ_VHOST,
    } = ConfigService.config.rabbitmq;

    const vhost = encodeURIComponent(RABBITMQ_VHOST || '/');
    const url = `amqp://${encodeURIComponent(RABBITMQ_USER)}:${encodeURIComponent(RABBITMQ_PASSWORD)}@${RABBITMQ_HOST}:${RABBITMQ_PORT}/${vhost}`;

    this.connection = await amqp.connect(url);
    this.connection.on('error', (error) => {
      this.logger.error(`RabbitMQ connection error: ${error.message}`);
    });

    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue('voc_panel.health', { durable: true });

    this.logger.log(`RabbitMQ connected at ${RABBITMQ_HOST}:${RABBITMQ_PORT}`);
  }

  getChannel(): amqp.Channel {
    return this.channel;
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
    } catch {
      // ignore close errors on shutdown
    }
    try {
      await this.connection?.close();
    } catch {
      // ignore close errors on shutdown
    }
  }
}
