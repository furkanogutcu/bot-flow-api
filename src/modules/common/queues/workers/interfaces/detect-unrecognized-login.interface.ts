import { IUserAgent } from '../../../../../common/interfaces/express-request.interface';

export interface IDetectUnrecognizedLoginParams {
  userID: string;
  sessionID: string;
  request: {
    ipAddress: string;
    userAgent: IUserAgent;
    timestamp: number;
  };
}
