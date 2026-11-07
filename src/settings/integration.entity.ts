import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import type { IntegrationId, IntegrationStatus } from './settings.enums';

@Entity('integrations')
export class IntegrationEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: IntegrationId;

  @Column({ type: 'varchar', default: 'disconnected' })
  status!: IntegrationStatus;

  @Column({ type: 'varchar' })
  endpoint!: string;

  @Column({ type: 'timestamp', nullable: true })
  lastSyncAt!: Date | null;

  @Column({ type: 'int', nullable: true })
  latencyMs!: number | null;

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @UpdateDateColumn()
  updatedAt!: Date;
}
