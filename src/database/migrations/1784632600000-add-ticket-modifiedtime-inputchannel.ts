import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTicketModifiedtimeInputchannel1784632600000 implements MigrationInterface {
  name = 'AddTicketModifiedtimeInputchannel1784632600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD "modifiedtime" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD "inputchannel" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "inputchannel"`);
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "modifiedtime"`);
  }
}
