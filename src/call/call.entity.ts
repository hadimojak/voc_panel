import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

/**
 * Call-center record (تماس‌ها) — columns aligned with Day CRM Excel export
 * `call_records.xlsx` and smart-dashboard Call UI.
 */
@Entity('calls')
export class CallEntity {
  /** شماره رکورد — e.g. IC11170 */
  @PrimaryColumn({ type: 'varchar' })
  callid!: string;

  /** نوع تماس — گفت و گو / ارتباط دهی */
  @Column({ type: 'varchar', nullable: true })
  calltype!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  @Index()
  createdtime!: Date | null;

  @Column({ type: 'varchar', nullable: true })
  @Index()
  nationalcode!: string | null;

  @Column({ type: 'varchar', nullable: true })
  fname!: string | null;

  @Column({ type: 'varchar', nullable: true })
  lname!: string | null;

  @Column({ type: 'varchar', nullable: true })
  @Index()
  mobile!: string | null;

  /** مشتری سازمانی */
  @Column({ type: 'varchar', nullable: true })
  accountname!: string | null;

  @Column({ type: 'varchar', nullable: true })
  branchname!: string | null;

  /** نوع بیمه نامه */
  @Column({ type: 'varchar', nullable: true })
  productname!: string | null;

  @Column({ type: 'varchar', nullable: true })
  inputchannel!: string | null;

  /** مالک رکورد (agent) */
  @Column({ type: 'varchar', nullable: true })
  ownername!: string | null;

  /** SMART UI fields (defaults for historical CRM rows). */
  @Column({ type: 'varchar', nullable: true, default: 'inbound' })
  direction!: string | null;

  @Column({ type: 'varchar', nullable: true, default: 'answered' })
  status!: string | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  durationsec!: number | null;

  @Column({ type: 'int', nullable: true, default: 0 })
  waitsec!: number | null;

  @Column({ type: 'varchar', nullable: true })
  sentiment!: string | null;

  @Column({ type: 'varchar', nullable: true })
  priority!: string | null;
}
