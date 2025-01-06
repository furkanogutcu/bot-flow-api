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
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { IUserAgent } from '../../../common/interfaces/express-request.interface';
import { JoinColumnKey } from '../../../common/references/join-column.reference';
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

  @Column({ type: 'varchar', unique: true })
  session_key: string;

  @Column({ type: 'varchar' })
  refresh_token_hash: string;

  @Column({ type: 'json', nullable: true })
  user_agent?: IUserAgent | null;

  @Column({ type: 'varchar', nullable: true })
  ip_address?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  last_accessed_at?: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  revoked_at?: Date | null;

  @BeforeInsert()
  @BeforeUpdate()
  private async hashRefreshToken(): Promise<void> {
    if (!this.refresh_token_hash) return;

    this.refresh_token_hash = await argon2.hash(this.refresh_token_hash);
  }
}
