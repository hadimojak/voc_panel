import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCallsCustomers1784633000000 implements MigrationInterface {
  name = 'AddCallsCustomers1784633000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "calls" (
        "callid" character varying NOT NULL,
        "calltype" character varying,
        "createdtime" TIMESTAMP,
        "nationalcode" character varying,
        "fname" character varying,
        "lname" character varying,
        "mobile" character varying,
        "accountname" character varying,
        "branchname" character varying,
        "productname" character varying,
        "inputchannel" character varying,
        "ownername" character varying,
        "direction" character varying DEFAULT 'inbound',
        "status" character varying DEFAULT 'answered',
        "durationsec" integer DEFAULT 0,
        "waitsec" integer DEFAULT 0,
        "sentiment" character varying,
        "priority" character varying,
        CONSTRAINT "PK_calls" PRIMARY KEY ("callid")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_calls_createdtime" ON "calls" ("createdtime")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_calls_nationalcode" ON "calls" ("nationalcode")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_calls_mobile" ON "calls" ("mobile")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "customers" (
        "nationalcode" character varying NOT NULL,
        "fname" character varying,
        "lname" character varying,
        "mobile" character varying,
        "accountname" character varying,
        "branchname" character varying,
        "productname" character varying,
        "kind" character varying NOT NULL DEFAULT 'individual',
        "status" character varying NOT NULL DEFAULT 'active',
        "isvip" boolean NOT NULL DEFAULT false,
        "gender" character varying,
        "activepolicycount" integer NOT NULL DEFAULT 0,
        "openticketcount" integer NOT NULL DEFAULT 0,
        "callcount" integer NOT NULL DEFAULT 0,
        "lastinteractionat" TIMESTAMP,
        "lastsentiment" character varying,
        "customersince" TIMESTAMP,
        "createdat" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedat" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_customers" PRIMARY KEY ("nationalcode")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_customers_mobile" ON "customers" ("mobile")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "customers"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "calls"`);
  }
}
