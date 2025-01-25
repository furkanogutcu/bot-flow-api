import argon2 from 'argon2';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MFAMethod } from '../../../common/references/mfa.reference';
import { UserRole } from '../../../common/references/user-role.reference';
import { UserStatus } from '../../../common/references/user-status.reference';
import { Session } from '../../sessions/entities/session.entity';
import { SuspiciousActivity } from '../../suspicious-activity/entities/suspicious-activity.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => SuspiciousActivity, (activity) => activity.user)
  suspicious_activities: SuspiciousActivity[];

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PendingEmailVerification,
  })
  status: UserStatus;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.Member,
  })
  role: UserRole;

  @Column({ type: 'boolean', default: false })
  mfa_enabled: boolean;

  @Column({
    type: 'enum',
    enum: MFAMethod,
    nullable: true,
  })
  mfa_method?: MFAMethod | null;

  @Column({ type: 'varchar', nullable: true, select: false })
  mfa_secret?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deleted_at?: Date | null;

  @BeforeInsert()
  @BeforeUpdate()
  private async hashPassword(): Promise<void> {
    if (!this.passwordHash) return;

    this.passwordHash = await argon2.hash(this.passwordHash);
  }
}
