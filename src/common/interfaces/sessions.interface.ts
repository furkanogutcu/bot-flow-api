import { Session } from '../../modules/sessions/entities/session.entity';

export type SessionView = Pick<Session, 'id' | 'user_agent' | 'ip_address' | 'created_at' | 'last_accessed_at'>;
