import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  superAdmin,
  admin,
  user,
}

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

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

  @Column({ unique: true, nullable: true })
  email!: string;

  @Column({ nullable: false, default: 1 })
  role!: UserRole;
}
