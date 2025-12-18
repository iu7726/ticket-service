import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  // APP
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  // DATABASE (MySQL)
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(3306),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),

  // REDIS
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379),
});

export interface EnvValidationSchema {
  // APP
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;

  // DATABASE (MySQL)
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_DATABASE: string;

  // REDIS
  REDIS_HOST: string;
  REDIS_PORT: number;
}