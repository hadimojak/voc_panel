import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigValidationSchema } from './model/configuration.schema';

const env = process.env.NODE_ENV || 'dev';

const fileName = `.${env}.env`;
const filePath = path.resolve(process.cwd(), fileName);

if (fs.existsSync(filePath)) {
  dotenv.config({ path: filePath });
} else throw new Error(`Environment file ${fileName} not found!`);

const { value: validatedEnv, error } = ConfigValidationSchema.validate(
  process.env,
  {
    abortEarly: false,
    stripUnknown: false,
  },
);

if (error) {
  const errorMessages = error.details
    .map((detail) => `${detail.context?.key}: ${detail.message}`)
    .join(', ');
  throw new Error(`Environment validation failed: ${errorMessages}`);
}

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
