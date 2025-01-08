import argon2 from 'argon2';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { IUserAgent } from '../../../common/interfaces/express-request.interface';
import { JoinColumnKey } from '../../../common/references/join-column.reference';
import { SuspiciousActivity } from '../../suspicious-activity/entities/suspicious-activity.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'sessions' })
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.sessions, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: JoinColumnKey.UserID })
  user: User;

  @OneToMany(() => SuspiciousActivity, (activity) => activity.session)
  suspicious_activities: SuspiciousActivity[];

  @Column({ type: 'varchar', unique: true })
  session_key: string;

  @Column({ type: 'varchar' })
  refresh_token_hash: string;

  @Column({ type: 'json', nullable: true })
  user_agent?: IUserAgent | null;

  @Column({ type: 'varchar', nullable: true })
  ip_address?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  last_accessed_at?: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  revoked_at?: Date | null;

  @BeforeInsert()
  @BeforeUpdate()
  private async hashRefreshToken(): Promise<void> {
    if (!this.refresh_token_hash) return;

    this.refresh_token_hash = await argon2.hash(this.refresh_token_hash);
  }
}
