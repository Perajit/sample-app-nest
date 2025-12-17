import 'dotenv/config';
import { registerAs } from '@nestjs/config';

interface JwtConfig {
  accessSecret: string;
  accessExpiresIn: string;
  accessIssuer: string;
  refreshSecret: string;
  refreshExpiresIn: string;
  refreshIssuer: string;
}

export default registerAs(
  'jwt',
  (): JwtConfig => ({
    accessSecret: process.env.JWT_ACCESS_SECRET || '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
    accessIssuer: process.env.JWT_ACCESS_ISSUER || '',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    refreshIssuer: process.env.JWT_ACCESS_ISSUER || '',
  }),
);
