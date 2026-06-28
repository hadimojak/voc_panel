import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('tickets')
export class TicketEntity {
  @PrimaryColumn({ type: 'bigint' })
  ticketid!: string;

  @Column({ type: 'varchar', nullable: true })
  ticket_no!: string;

  @Column({ type: 'varchar', nullable: true })
  nationalcode!: string;

  @Column({ type: 'varchar', nullable: true })
  accountname!: string;

  @Column({ type: 'varchar', nullable: true })
  fname!: string;

  @Column({ type: 'varchar', nullable: true })
  lname!: string;

  @Column({ type: 'varchar', nullable: true })
  mobile!: string;

  @Column({ type: 'varchar', nullable: true })
  productname!: string;

  @Column({ type: 'varchar', nullable: true })
  branchname!: string;

  @Column({ type: 'varchar', nullable: true })
  mainticket!: string;

  @Column({ type: 'varchar', nullable: true })
  subticket!: string;

  @Column({ type: 'varchar', nullable: true })
  reqtypeticket!: string;

  @Column({ type: 'timestamp', nullable: true })
  createdtime!: Date;

  @Column({ type: 'varchar', nullable: true })
  tickettype!: string;

  @Column({ type: 'text', nullable: true })
  complainttext!: string;

  @Column({ type: 'varchar', nullable: true })
  maincomplaint!: string;

  @Column({ type: 'varchar', nullable: true })
  complaintstatus!: string;

  @Column({ type: 'text', nullable: true })
  finalanswer!: string;

  @Column({ type: 'date', nullable: true })
  closeddate!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ type: 'varchar', nullable: true })
  mainrequest!: string | null;

  @Column({ type: 'varchar', nullable: true })
  mainoffer!: string | null;

  @Column({ type: 'varchar', nullable: true })
  ownername!: string;
}
