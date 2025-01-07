import { IUserAgent } from '../interfaces/express-request.interface';

export enum SuspiciousActivityType {
  UnrecognizedLogin = 'UNRECOGNIZED_LOGIN',
}

export interface ISuspiciousActivityDetails {
  ip_address?: string;
  user_agent?: IUserAgent;
}
