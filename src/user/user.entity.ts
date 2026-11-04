import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Matches smart-dashboard Role: agent | supervisor | admin */
export enum UserRole {
  agent = 'agent',
  supervisor = 'supervisor',
  admin = 'admin',
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar' })
  fullName!: string;

  @Column({ unique: true, type: 'varchar' })
  mobile!: string;

  @Column({ type: 'text' })
  password!: string;

  @Column({ type: 'text', nullable: true })
  refreshTokenHash!: string | null;

  @Column({ type: 'int', default: 0 })
  tokenVersion!: number;

  @Column({ type: 'text', nullable: true })
  passwordResetToken!: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpiresAt!: Date | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email!: string | null;

  @Column({ type: 'varchar', nullable: false, default: UserRole.agent })
  role!: UserRole;

  @Column({ type: 'varchar', default: '' })
  team!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt!: Date | null;
}
