import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response as Res } from 'express';
import { AuthService } from './auth.service';
import {
  ACCESS_COOKIE_KEY,
  REFRESH_COOKIE_KEY,
} from './constants/auth.constant';
import { LoginResponse } from './dto/login-response.dto';
import { RefreshResponse } from './dto/refresh-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthTokens } from './interfaces/auth-jwt';
import { AuthRequest, RequestWithCookies } from './interfaces/auth-request';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Request()
    req: AuthRequest,

    @Response({ passthrough: true })
    res: Res,
  ): Promise<LoginResponse> {
    const tokens = await this.authService.login(req.user);
    this.attachTokens(tokens, res);

    return { user: req.user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Request()
    req: RequestWithCookies,

    @Response({ passthrough: true })
    res: Res,
  ): Promise<RefreshResponse> {
    const requestToken = req.cookies[REFRESH_COOKIE_KEY];

    if (!requestToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    const tokens = await this.authService.refresh(requestToken);
    this.attachTokens(tokens, res);

    return {};
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('logout')
  async logout(
    @Request()
    req: AuthRequest,

    @Response({ passthrough: true })
    res: Res,
  ): Promise<void> {
    res.clearCookie(ACCESS_COOKIE_KEY);
    res.clearCookie(REFRESH_COOKIE_KEY);

    return this.authService.logout(req.user);
  }

  private attachTokens(tokens: AuthTokens, res: Res) {
    res.cookie(ACCESS_COOKIE_KEY, tokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: tokens.accessExpiresInMs,
    });

    res.cookie(REFRESH_COOKIE_KEY, tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: tokens.refreshExpiresInMs,
    });
  }
}
