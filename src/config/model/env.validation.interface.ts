export interface EnvValidationInterface {
  PORT: number;

  POSTGRES_HOST: string;
  POSTGRES_PORT: number;
  POSTGRES_DB: string;
  POSTGRES_USER: string;
  POSTGRES_PASSWORD: string;
  /** When true, TypeORM creates/updates tables from entities on connect (code-first). */
  TYPEORM_SYNCHRONIZE: boolean;

  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string;

  RABBITMQ_HOST: string;
  RABBITMQ_PORT: number;
  RABBITMQ_USER: string;
  RABBITMQ_PASSWORD: string;
  RABBITMQ_VHOST: string;

  JWT_SECRET: string;
  JWT_REFRESH_SECRET: string;

  SUPERSET_URL: string;
  SUPERSET_USERNAME: string;
  SUPERSET_PASSWORD: string;
  SUPERSET_PROVIDER: string;

  CRM_FETCH_URL: string;
  CRM_CALLS_FETCH_URL: string;
  CRM_SOURCE: string;
  CRM_FETCH_LIMIT: number;
  CRM_SYNC_ENABLED: boolean;
  CRM_INITIAL_LAST_TICKETID: string;
  CRM_CURSOR_FILE: string;
}
