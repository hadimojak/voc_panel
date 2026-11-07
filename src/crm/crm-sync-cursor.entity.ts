import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Persists CRM pagination cursor between sync runs. */
@Entity('crm_sync_cursors')
export class CrmSyncCursorEntity {
  @PrimaryColumn({ type: 'varchar', length: 64 })
  key!: string;

  @Column({ type: 'varchar' })
  lastModified!: string;

  @Column({ type: 'varchar' })
  lastTicketId!: string;

  @Column({ type: 'int', default: 0 })
  chunksProcessed!: number;

  @Column({ type: 'int', default: 0 })
  ticketsUpserted!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
