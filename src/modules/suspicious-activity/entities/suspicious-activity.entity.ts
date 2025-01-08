import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { JoinColumnKey } from '../../../common/references/join-column.reference';
import {
  ISuspiciousActivityDetails,
  SuspiciousActivityType,
} from '../../../common/references/suspicious-activity.reference';
import { Session } from '../../sessions/entities/session.entity';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'suspicious_activities' })
export class SuspiciousActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.suspicious_activities, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: JoinColumnKey.UserID })
  user: User;

  @ManyToOne(() => Session, (session) => session.suspicious_activities, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: JoinColumnKey.SessionID })
  session?: Session | null;

  @Column({
    type: 'enum',
    enum: SuspiciousActivityType,
  })
  type: SuspiciousActivityType;

  @Column({ type: 'json', nullable: true })
  details?: ISuspiciousActivityDetails | null;

  @Column({ type: 'varchar', unique: true, nullable: true })
  resolve_token?: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  resolved_at?: Date | null;
}
