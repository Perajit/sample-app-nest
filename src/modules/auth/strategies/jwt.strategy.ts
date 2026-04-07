import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import jwtConfig from 'src/config/jwt.config';
import { ACCESS_COOKIE_KEY } from 'src/modules/auth/constants/auth.constant';
import { AuthJwtPayload } from 'src/modules/auth/interfaces/auth-jwt';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfigValues: ConfigType<typeof jwtConfig>,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          const cookies = (req.cookies || null) as {
            [key: string]: string;
          } | null;
          console.log('--- jwt extract', {
            cookies,
            accessToken: cookies?.[ACCESS_COOKIE_KEY] || null,
          });
          return cookies?.[ACCESS_COOKIE_KEY] || null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtConfigValues.accessSecret,
    });
  }

  async validate(payload: AuthJwtPayload): Promise<User> {
    console.log('--- jwt validate');
    const id = payload.sub as number;
    const user = await this.usersService.getUserById(id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
