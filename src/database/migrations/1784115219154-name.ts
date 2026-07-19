import { MigrationInterface, QueryRunner } from 'typeorm';

export class Name1784115219154 implements MigrationInterface {
  name = 'Name1784115219154';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tickets" ADD "lat" double precision`);
    await queryRunner.query(`ALTER TABLE "tickets" ADD "lng" double precision`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "lng"`);
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "lat"`);
  }
}
