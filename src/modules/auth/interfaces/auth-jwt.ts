export interface AuthJwtPayload {
  sub: string | number;
  iat: number;
  exp: number;
  [key: string]: string | number;
}

export interface AuthTokens {
  accessToken: string;
  accessExpiresInMs: number;
  refreshToken: string;
  refreshExpiresInMs: number;
}
