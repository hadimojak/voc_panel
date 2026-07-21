import { MigrationInterface, QueryRunner } from "typeorm";

export class Name1784632488049 implements MigrationInterface {
    name = 'Name1784632488049'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tickets" ("ticketid" bigint NOT NULL, "ticket_no" character varying, "nationalcode" character varying, "accountname" character varying, "fname" character varying, "lname" character varying, "mobile" character varying, "productname" character varying, "branchname" character varying, "mainticket" character varying, "subticket" character varying, "reqtypeticket" character varying, "createdtime" TIMESTAMP, "tickettype" character varying, "complainttext" text, "maincomplaint" character varying, "complaintstatus" character varying, "finalanswer" text, "closeddate" date, "description" text, "mainrequest" character varying, "mainoffer" character varying, "ownername" character varying, "lat" double precision, "lng" double precision, CONSTRAINT "PK_0861bb3e8727787970906c80c40" PRIMARY KEY ("ticketid"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "password" text NOT NULL, "refreshTokenHash" text, "tokenVersion" integer NOT NULL DEFAULT '0', "passwordResetToken" text, "passwordResetExpiresAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying, "role" integer NOT NULL DEFAULT '1', CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "tickets"`);
    }

}
