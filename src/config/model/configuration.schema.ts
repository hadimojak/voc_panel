import * as Joi from 'joi';
import { EnvValidationInterface } from './env.validation.interface';

export const ConfigValidationSchema: Joi.ObjectSchema<EnvValidationInterface> =
  Joi.object<EnvValidationInterface>({
    PORT: Joi.number().port(),
    //postgres
    POSTGRES_HOST: Joi.string().hostname().required(),
    POSTGRES_PORT: Joi.number().port().default(5432),
    POSTGRES_DB: Joi.string().required(),
    POSTGRES_USER: Joi.string().alphanum().min(3).required(),
    POSTGRES_PASSWORD: Joi.string().min(6).required(),
    TYPEORM_SYNCHRONIZE: Joi.boolean().truthy('true').falsy('false').default(true),
    //redis
    REDIS_HOST: Joi.string().hostname().required(),
    REDIS_PORT: Joi.number().port().default(6379),
    REDIS_PASSWORD: Joi.string().min(1).required(),
    //rabbitmq
    RABBITMQ_HOST: Joi.string().hostname().required(),
    RABBITMQ_PORT: Joi.number().port().default(5672),
    RABBITMQ_USER: Joi.string().required(),
    RABBITMQ_PASSWORD: Joi.string().min(1).required(),
    RABBITMQ_VHOST: Joi.string().default('/'),
    //jwt
    JWT_SECRET: Joi.string().required(),
    JWT_REFRESH_SECRET: Joi.string().required(),
    //superset
    SUPERSET_URL: Joi.string().uri().required(),
    SUPERSET_USERNAME: Joi.string().required(),
    SUPERSET_PASSWORD: Joi.string().required(),
    SUPERSET_PROVIDER: Joi.string().required(),
    // CRM VOC fetch (company VPN required) — type=new incremental sync
    CRM_FETCH_URL: Joi.string()
      .uri()
      .default('https://crm.dayins.com/panel/rest/voc_fetch_all/'),
    CRM_CALLS_FETCH_URL: Joi.string()
      .uri()
      .default('https://crm.dayins.com/panel/rest/voc_fetch_all_calls/'),
    CRM_SOURCE: Joi.string().default('smart'),
    CRM_FETCH_LIMIT: Joi.number().integer().min(1).max(5000).default(1000),
    CRM_SYNC_ENABLED: Joi.boolean().truthy('true').falsy('false').default(true),
    CRM_INITIAL_LAST_TICKETID: Joi.string().default('0'),
    CRM_CURSOR_FILE: Joi.string().default('crm-sync-cursors.json'),
  }).unknown(true);
