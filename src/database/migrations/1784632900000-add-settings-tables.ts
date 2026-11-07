import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSettingsTables1784632900000 implements MigrationInterface {
  name = 'AddSettingsTables1784632900000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "system_settings" (
        "id" integer NOT NULL,
        "slaDays" integer NOT NULL DEFAULT 7,
        "defaultPageSize" integer NOT NULL DEFAULT 20,
        "negativeSentimentAlert" double precision NOT NULL DEFAULT 0.3,
        "repeatCallThreshold" integer NOT NULL DEFAULT 3,
        "incomingCallPopup" boolean NOT NULL DEFAULT true,
        "autoTagging" boolean NOT NULL DEFAULT true,
        "transcription" boolean NOT NULL DEFAULT true,
        "voiceRetentionDays" integer NOT NULL DEFAULT 365,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_system_settings" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "integrations" (
        "id" character varying NOT NULL,
        "status" character varying NOT NULL DEFAULT 'disconnected',
        "endpoint" character varying NOT NULL,
        "lastSyncAt" TIMESTAMP,
        "latencyMs" integer,
        "enabled" boolean NOT NULL DEFAULT true,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_integrations" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "scenarios" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "description" text NOT NULL DEFAULT '',
        "triggerSubject" character varying,
        "keywords" jsonb NOT NULL DEFAULT '[]',
        "active" boolean NOT NULL DEFAULT true,
        "suggestionCount" integer NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_scenarios" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "scenarios"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "integrations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "system_settings"`);
  }
}
