import 'dotenv/config';
import { registerAs } from '@nestjs/config';

interface AppConfig {
  port: number;
  clientOrigin: string;
  security: {
    saltRounds: number;
  };
}

export default registerAs(
  'app',
  (): AppConfig => ({
    port: parseInt(process.env.APP_PORT || '3000', 10),
    clientOrigin: process.env.APP_CLIENT_ORIGIN || '',
    security: {
      saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
    },
  }),
);
