import { Request } from 'express';

import { Session } from '../../modules/sessions/entities/session.entity';

export interface IRequest extends Request {
  session: Pick<Session, 'id' | 'session_key' | 'user'>;
}
