import { Request } from 'express';
import { User } from 'src/modules/users/entities/user.entity';

export interface RequestWithCookies extends Request {
  cookies: {
    [key: string]: string | undefined;
  };
}

export interface AuthRequest extends RequestWithCookies {
  user: User;
}
