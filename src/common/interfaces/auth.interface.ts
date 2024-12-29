import { TokenType } from '../references/auth.reference';

export interface IJWTTokensResponse {
  access_token: string;
  refresh_token: string;
  token_type: TokenType.Bearer;
  expires_in: number;
}

export interface IJWTTokenPayload {
  sub: string;
  sessionKey: string;
}
