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
  dotenv.config({ path: filePath });
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
} as const;

export type AppConfig = typeof config;
