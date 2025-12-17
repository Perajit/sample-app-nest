import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import jwtConfig from 'src/config/jwt.config';
import { AuthJwtPayload } from 'src/modules/auth/interfaces/auth-jwt';
import { UsersService } from 'src/modules/users/users.service';
import { User } from 'src/modules/users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(jwtConfig.KEY)
    private jwtConfigValues: ConfigType<typeof jwtConfig>,

    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConfigValues.accessSecret,
    });
  }

  async validate(payload: AuthJwtPayload): Promise<User> {
    const id = payload.sub as number;
    const user = await this.usersService.getUserById(id);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
