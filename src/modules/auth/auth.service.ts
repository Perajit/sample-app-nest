import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import * as ms from 'ms';
import jwtConfig from 'src/config/jwt.config';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersService } from 'src/modules/users/users.service';
import { MoreThan, Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { AuthTokens } from './interfaces/auth-jwt';

const msFn = ms as unknown as (value: ms.StringValue) => number;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,

    @Inject(jwtConfig.KEY)
    private jwtConfigValues: ConfigType<typeof jwtConfig>,

    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
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

  async login(user: User): Promise<AuthTokens> {
    // prevent concurrent login: invalidate all existing sessions for this user
    await this.sessionRepository.delete({ userId: user.id });

    return this.createTokensWithSession(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const hashedRefreshToken = this.hashToken(refreshToken);
    const session = await this.sessionRepository.findOne({
      where: { hashedRefreshToken, expiresAt: MoreThan(new Date()) },
      relations: ['user'],
    });

    if (!session) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // token rotation: delete old session, issue new one
    await this.sessionRepository.delete(session.id);

    return this.createTokensWithSession(session.user);
  }

  async logout(user: User) {
    await this.sessionRepository.delete({ userId: user.id });
  }

  private async createTokensWithSession(user: User): Promise<AuthTokens> {
    const { accessToken, accessExpiresInMs } = this.createAccessToken(user);
    const { refreshToken, refreshExpiresInMs } =
      await this.createRefreshTokenWithSession(user);

    return {
      accessToken,
      accessExpiresInMs,
      refreshToken,
      refreshExpiresInMs,
    };
  }

  private createAccessToken(user: User): {
    accessToken: string;
    accessExpiresInMs: number;
  } {
    const payload = { sub: user.id, email: user.email };
    const expiresIn = this.jwtConfigValues.accessExpiresIn;

    const accessToken = this.jwtService.sign(payload, {
      secret: this.jwtConfigValues.accessSecret,
      expiresIn: expiresIn as JwtSignOptions['expiresIn'],
    });

    return {
      accessToken,
      accessExpiresInMs: msFn(expiresIn as ms.StringValue),
    };
  }

  private async createRefreshTokenWithSession(
    user: User,
  ): Promise<{ refreshToken: string; refreshExpiresInMs: number }> {
    const refreshToken = randomBytes(40).toString('hex');
    const hashedRefreshToken = this.hashToken(refreshToken);

    const expiresIn = this.jwtConfigValues.refreshExpiresIn;
    const expiresInMs = msFn(expiresIn as ms.StringValue);
    const expiresAt = new Date(Date.now() + expiresInMs);

    await this.sessionRepository.save({
      userId: user.id,
      hashedRefreshToken,
      expiresAt,
    });

    return {
      refreshToken,
      refreshExpiresInMs: expiresInMs,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
