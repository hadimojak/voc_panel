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
    //jwt
    JWT_SECRET: Joi.string().required(),
    JWT_REFRESH_SECRET: Joi.string().required(),
    //superset
    SUPERSET_URL: Joi.string().uri().required(),
    SUPERSET_USERNAME: Joi.string().required(),
    SUPERSET_PASSWORD: Joi.string().required(),
    SUPERSET_PROVIDER: Joi.string().required(),
  }).unknown(true);
