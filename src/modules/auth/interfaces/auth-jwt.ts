export interface AuthJwtPayload {
  sub: string | number;
  iat: number;
  exp: number;
  [key: string]: string | number;
}
