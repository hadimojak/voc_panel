import * as Joi from 'joi';
import { EnvValidationInterface } from './env.validation.interface';

export const ConfigValidationSchema = Joi.object<EnvValidationInterface>({
  PORT: Joi.number().port(),
  //postgress
  POSTGRES_HOST: Joi.string().hostname().required(),
  POSTGRES_PORT: Joi.number().port().default(5432),
  POSTGRES_DB: Joi.string().required(),
  POSTGRES_USER: Joi.string().alphanum().min(3).required(),
  POSTGRES_PASSWORD: Joi.string().min(6).required(),
}).unknown(true);
