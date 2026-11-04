import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlignUsersWithFrontendAuth1784632700000
  implements MigrationInterface
{
  name = 'AlignUsersWithFrontendAuth1784632700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`TRUNCATE TABLE "users" RESTART IDENTITY CASCADE`);

    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_fe0bb3f6520ee0469504521e710"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "username"`);

    await queryRunner.query(
      `ALTER TABLE "users" ADD "fullName" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "mobile" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "team" character varying NOT NULL DEFAULT ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "active" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "lastLoginAt" TIMESTAMP`,
    );

    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "role" TYPE character varying
      USING (
        CASE "role"::text
          WHEN '0' THEN 'admin'
          WHEN '1' THEN 'admin'
          WHEN '2' THEN 'agent'
          ELSE 'agent'
        END
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'agent'`,
    );

    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "mobile" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_users_mobile" UNIQUE ("mobile")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "fullName" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "UQ_users_mobile"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "lastLoginAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "active"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "team"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "mobile"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "fullName"`);

    await queryRunner.query(
      `ALTER TABLE "users" ADD "username" character varying`,
    );
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "role" TYPE integer
      USING (
        CASE "role"
          WHEN 'admin' THEN 1
          WHEN 'supervisor' THEN 1
          ELSE 2
        END
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 1`,
    );
  }
}
