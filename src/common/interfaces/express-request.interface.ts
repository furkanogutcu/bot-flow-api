import { Request } from 'express';

import { Session } from '../../modules/sessions/entities/session.entity';

export interface IUserAgent {
  browser?: string;
  device?: string;
  os?: string;
  cpu?: string;
  engine?: string;
  raw: string;
}

export interface IRequest extends Request {
  session: Pick<Session, 'id' | 'session_key' | 'user'>;
}
