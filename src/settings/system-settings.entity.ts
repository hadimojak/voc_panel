import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

/** Singleton row (id = 1) — mirrors smart-dashboard SystemSettings. */
@Entity('system_settings')
export class SystemSettingsEntity {
  @PrimaryColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'int', default: 7 })
  slaDays!: number;

  @Column({ type: 'int', default: 20 })
  defaultPageSize!: number;

  @Column({ type: 'double precision', default: 0.3 })
  negativeSentimentAlert!: number;

  @Column({ type: 'int', default: 3 })
  repeatCallThreshold!: number;

  @Column({ type: 'boolean', default: true })
  incomingCallPopup!: boolean;

  @Column({ type: 'boolean', default: true })
  autoTagging!: boolean;

  @Column({ type: 'boolean', default: true })
  transcription!: boolean;

  @Column({ type: 'int', default: 365 })
  voiceRetentionDays!: number;

  @UpdateDateColumn()
  updatedAt!: Date;
}
