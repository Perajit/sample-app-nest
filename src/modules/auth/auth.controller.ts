import {
  Controller,
  Post,
  Request,
  Response,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Response as Res } from 'express';
import { AuthRequest } from './interfaces/auth-request';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { MutationResponseDto } from 'src/common/dto/mutation-response.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

const AUTH_REFRESH_KEY = 'refresh_token';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private generateAndAttachTokens(req: AuthRequest, res: Res) {
    const { accessToken, refreshToken, refreshExpiresInMs } =
      this.authService.issueTokens(req.user);

    res.cookie(AUTH_REFRESH_KEY, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      expires: new Date(Date.now() + refreshExpiresInMs),
    });

    return { accessToken };
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @Request()
    req: AuthRequest,

    @Response({ passthrough: true })
    res: Res,
  ): AuthResponseDto {
    return this.generateAndAttachTokens(req, res);
  }

  @Post('refresh')
  refresh(
    @Request()
    req: AuthRequest,

    @Response({ passthrough: true })
    res: Res,
  ) {
    const requestRefreshToken = req.cookies[AUTH_REFRESH_KEY];

    if (!requestRefreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    return this.generateAndAttachTokens(req, res);
  }

  @UseGuards(LocalAuthGuard)
  @Post('logout')
  logout(
    @Response({ passthrough: true })
    res: Res,
  ): MutationResponseDto {
    res.clearCookie(AUTH_REFRESH_KEY);

    return this.authService.logout();
  }
}
