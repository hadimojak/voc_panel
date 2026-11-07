import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Customer 360 identity (مشتریان) — derived from unique callers on calls/tickets.
 * Primary key is national code when valid; otherwise a synthetic `M-{mobile}` key.
 */
@Entity('customers')
export class CustomerEntity {
  @PrimaryColumn({ type: 'varchar' })
  nationalcode!: string;

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

  @Column({ type: 'varchar', nullable: true })
  productname!: string | null;

  /** individual | corporate */
  @Column({ type: 'varchar', default: 'individual' })
  kind!: string;

  /** active | inactive | suspended */
  @Column({ type: 'varchar', default: 'active' })
  status!: string;

  @Column({ type: 'boolean', default: false })
  isvip!: boolean;

  @Column({ type: 'varchar', nullable: true })
  gender!: string | null;

  @Column({ type: 'int', default: 0 })
  activepolicycount!: number;

  @Column({ type: 'int', default: 0 })
  openticketcount!: number;

  @Column({ type: 'int', default: 0 })
  callcount!: number;

  @Column({ type: 'timestamp', nullable: true })
  lastinteractionat!: Date | null;

  @Column({ type: 'varchar', nullable: true })
  lastsentiment!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  customersince!: Date | null;

  @CreateDateColumn()
  createdat!: Date;

  @UpdateDateColumn()
  updatedat!: Date;
}
