import * as dotenv from 'dotenv';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ConfigValidationSchema } from './model/configuration.schema';
import { ValidationResult } from 'joi';
import { EnvValidationInterface } from './model/env.validation.interface';

const env = process.env.NODE_ENV || 'dev';

const fileName = `.${env}.env`;
const filePath = path.resolve(process.cwd(), fileName);

if (fs.existsSync(filePath)) {
  dotenv.config({ path: filePath, quiet: true });
} else throw new Error(`Environment file ${fileName} not found!`);

const validationResult: ValidationResult<EnvValidationInterface> =
  ConfigValidationSchema.validate(process.env, {
    abortEarly: false,
    stripUnknown: false,
  });

if (validationResult.error) {
  const errorMessages = validationResult.error.details
    .map((detail) => `${detail.context?.key}: ${detail.message}`)
    .join(', ');
  throw new Error(`Environment validation failed: ${errorMessages}`);
}

const validatedEnv = validationResult.value;

export const config = {
  env,
  app: {
    port: validatedEnv.PORT,
  },
  postgress: {
    POSTGRES_HOST: validatedEnv.POSTGRES_HOST,
    POSTGRES_PORT: validatedEnv.POSTGRES_PORT,
    POSTGRES_DB: validatedEnv.POSTGRES_DB,
    POSTGRES_USER: validatedEnv.POSTGRES_USER,
    POSTGRES_PASSWORD: validatedEnv.POSTGRES_PASSWORD,
    synchronize: validatedEnv.TYPEORM_SYNCHRONIZE,
  },
  redis: {
    REDIS_HOST: validatedEnv.REDIS_HOST,
    REDIS_PORT: validatedEnv.REDIS_PORT,
    REDIS_PASSWORD: validatedEnv.REDIS_PASSWORD,
  },
  rabbitmq: {
    RABBITMQ_HOST: validatedEnv.RABBITMQ_HOST,
    RABBITMQ_PORT: validatedEnv.RABBITMQ_PORT,
    RABBITMQ_USER: validatedEnv.RABBITMQ_USER,
    RABBITMQ_PASSWORD: validatedEnv.RABBITMQ_PASSWORD,
    RABBITMQ_VHOST: validatedEnv.RABBITMQ_VHOST,
  },
  jwt: {
    SECRET: validatedEnv.JWT_SECRET,
    REFRESH_SECRET: validatedEnv.JWT_REFRESH_SECRET,
  },
  superset: {
    SUPERSET_URL: validatedEnv.SUPERSET_URL,
    SUPERSET_USERNAME: validatedEnv.SUPERSET_USERNAME,
    SUPERSET_PASSWORD: validatedEnv.SUPERSET_PASSWORD,
    SUPERSET_PROVIDER: validatedEnv.SUPERSET_PROVIDER,
  },
  crm: {
    fetchUrl: validatedEnv.CRM_FETCH_URL,
    callsFetchUrl: validatedEnv.CRM_CALLS_FETCH_URL,
    source: validatedEnv.CRM_SOURCE,
    limit: validatedEnv.CRM_FETCH_LIMIT,
    syncEnabled: validatedEnv.CRM_SYNC_ENABLED,
    initialLastTicketId: validatedEnv.CRM_INITIAL_LAST_TICKETID,
    cursorFile: validatedEnv.CRM_CURSOR_FILE,
  },
} as const;

export type AppConfig = typeof config;
