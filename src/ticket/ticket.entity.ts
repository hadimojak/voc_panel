import { Column, Entity, PrimaryColumn } from 'typeorm';
import type { OpenEnum } from '../common/types/open-enum';
import {
  ComplaintCause,
  ComplaintType,
  MainComplaintType,
  TicketPriority,
  TicketSentiment,
  TicketStatus,
  TicketType,
} from './enums/ticket.enums';

@Entity('tickets')
export class TicketEntity {
  @PrimaryColumn({ type: 'bigint' })
  ticketid!: string;

  @Column({ type: 'varchar', nullable: true })
  ticket_no!: string | null;

  @Column({ type: 'varchar', nullable: true })
  nationalcode!: string | null;

  @Column({ type: 'varchar', nullable: true })
  accountname!: string | null;

  @Column({ type: 'varchar', nullable: true })
  fname!: string | null;

  @Column({ type: 'varchar', nullable: true })
  lname!: string | null;

  @Column({ type: 'varchar', nullable: true })
  mobile!: string | null;

  @Column({ type: 'varchar', nullable: true })
  productname!: string | null;

  @Column({ type: 'varchar', nullable: true })
  branchname!: string | null;

  /** Parallel subject level1 (call / general taxonomy). Stored as varchar. */
  @Column({ type: 'varchar', nullable: true })
  mainticket!: OpenEnum<MainComplaintType> | null;

  /** نوع شکایت (subject level2). Stored as varchar — unknown CRM values allowed. */
  @Column({ type: 'varchar', nullable: true })
  subticket!: OpenEnum<ComplaintType> | null;

  /** علت شکایت (subject level3). Stored as varchar — unknown CRM values allowed. */
  @Column({ type: 'varchar', nullable: true })
  reqtypeticket!: OpenEnum<ComplaintCause> | null;

  @Column({ type: 'timestamp', nullable: true })
  createdtime!: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  modifiedtime!: Date | null;

  /** نوع تیکت. Stored as varchar — unknown CRM values allowed. */
  @Column({ type: 'varchar', nullable: true })
  tickettype!: OpenEnum<TicketType> | null;

  @Column({ type: 'varchar', nullable: true })
  inputchannel!: string | null;

  @Column({ type: 'text', nullable: true })
  complainttext!: string | null;

  /** نوع اصلی شکایت (subject level1). Stored as varchar — unknown CRM values allowed. */
  @Column({ type: 'varchar', nullable: true })
  maincomplaint!: OpenEnum<MainComplaintType> | null;

  /** وضعیت. Stored as varchar — unknown CRM values allowed. */
  @Column({ type: 'varchar', nullable: true })
  complaintstatus!: OpenEnum<TicketStatus> | null;

  @Column({ type: 'text', nullable: true })
  finalanswer!: string | null;

  @Column({ type: 'date', nullable: true })
  closeddate!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', nullable: true })
  mainrequest!: string | null;

  @Column({ type: 'varchar', nullable: true })
  mainoffer!: string | null;

  @Column({ type: 'varchar', nullable: true })
  ownername!: string | null;

  /** احساس (SMART). Stored as varchar — unknown values allowed. */
  @Column({ type: 'varchar', nullable: true })
  sentiment!: OpenEnum<TicketSentiment> | null;

  /** اولویت (SMART). Stored as varchar — unknown values allowed. */
  @Column({ type: 'varchar', nullable: true })
  priority!: OpenEnum<TicketPriority> | null;

  @Column({ type: 'double precision', nullable: true })
  lat?: number | null;

  @Column({ type: 'double precision', nullable: true })
  lng?: number | null;
}
