import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import * as ms from 'ms';
import jwtConfig from 'src/config/jwt.config';
import { MutationResponseDto } from 'src/common/dto/mutation-response.dto';
import { UsersService } from 'src/modules/users/users.service';
import { User } from 'src/modules/users/entities/user.entity';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private jwtConfigValues: ConfigType<typeof jwtConfig>,
  ) {}

  async validateAndGetUser(
    email: string,
    password: string,
  ): Promise<User | null> {
    const user = await this.usersService.getUserByEmail(email);
    const hashedPassword = user?.hashedPassword;

    if (hashedPassword) {
      const isMatched = await compare(password, hashedPassword);

      if (isMatched) {
        return user;
      }
    }

    return null;
  }

  issueTokens(
    user: User,
  ): AuthResponseDto & { refreshToken: string; refreshExpiresInMs: number } {
    const accessToken = this.signAccessToken(user);
    const refreshToken = this.signRefreshToken(user);

    const refreshExpiresIn = this.jwtConfigValues
      .refreshExpiresIn as ms.StringValue;

    return {
      accessToken,
      refreshToken,
      refreshExpiresInMs: ms(refreshExpiresIn),
    };
  }

  private signAccessToken(user: User): string {
    const payload = { sub: user.id, email: user.email };

    return this.jwtService.sign(payload, {
      secret: this.jwtConfigValues.accessSecret,
      expiresIn: this.jwtConfigValues
        .accessExpiresIn as JwtSignOptions['expiresIn'],
    });
  }

  private signRefreshToken(user: User): string {
    const payload = { sub: user.id };

    // TODO: save refresh token state before return
    return this.jwtService.sign(payload, {
      secret: this.jwtConfigValues.refreshSecret,
      expiresIn: this.jwtConfigValues
        .refreshExpiresIn as JwtSignOptions['expiresIn'],
    });
  }

  logout(): MutationResponseDto {
    // TODO: remove refresh token state before return
    return {
      status: 'success',
      message: 'Log out successfully',
    };
  }
}
