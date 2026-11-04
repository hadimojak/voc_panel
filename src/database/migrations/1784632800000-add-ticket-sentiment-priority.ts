import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTicketSentimentPriority1784632800000 implements MigrationInterface {
  name = 'AddTicketSentimentPriority1784632800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD "sentiment" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "tickets" ADD "priority" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "priority"`);
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "sentiment"`);
  }
}
