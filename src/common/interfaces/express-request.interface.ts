import { Request } from 'express';

import { Session } from '../../modules/sessions/entities/session.entity';
import { User } from '../../modules/users/entities/user.entity';

export interface IUserAgent {
  browser?: string;
  device?: string;
  os?: string;
  cpu?: string;
  engine?: string;
  raw: string;
}

export interface IRequest extends Request {
  session: Pick<Session, 'id' | 'session_key' | 'mfa_verified_at'> & {
    user: Pick<User, 'id' | 'role' | 'status' | 'mfa_enabled'>;
  };
  context: {
    ipAddress: string;
    userAgent: IUserAgent;
    timestamp: number;
  };
}
