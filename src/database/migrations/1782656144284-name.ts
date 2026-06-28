import { MigrationInterface, QueryRunner } from 'typeorm';

export class Name1782656144284 implements MigrationInterface {
  name = 'Name1782656144284';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tickets" ("ticketid" bigint NOT NULL, "ticket_no" character varying, "nationalcode" character varying, "accountname" character varying, "fname" character varying, "lname" character varying, "mobile" character varying, "productname" character varying, "branchname" character varying, "mainticket" character varying, "subticket" character varying, "reqtypeticket" character varying, "createdtime" TIMESTAMP, "tickettype" character varying, "complainttext" text, "maincomplaint" character varying, "complaintstatus" character varying, "finalanswer" text, "closeddate" date, "description" text, "mainrequest" character varying, "mainoffer" character varying, "ownername" character varying, CONSTRAINT "PK_0861bb3e8727787970906c80c40" PRIMARY KEY ("ticketid"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tickets"`);
  }
}
