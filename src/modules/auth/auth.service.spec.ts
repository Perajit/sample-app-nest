import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { hash } from 'bcrypt';
import { createHash } from 'crypto';
import * as ms from 'ms';
import { UserRole } from 'src/common/enums/user-role.enum';
import appConfig from 'src/config/app.config';
import jwtConfig from 'src/config/jwt.config';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersModule } from 'src/modules/users/users.module';
import { UsersService } from 'src/modules/users/users.service';
import {
  createTestingModule,
  mockedAppConfig,
  mockedJwtConfig,
} from 'src/test-utils';
import { MoreThan, Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { Session } from './entities/session.entity';
import { AuthTokens } from './interfaces/auth-jwt';

const msFn = ms as unknown as (value: ms.StringValue) => number;

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersRepository: Repository<User>;
  let sessionRepository: Repository<Session>;

  const userData: Partial<User> = {
    email: 'user@mail.com',
    firstName: 'First',
    lastName: 'Last',
    roles: [UserRole.ADMIN],
  };
  const password = 'pwd';

  beforeEach(async () => {
    const module = await createTestingModule({
      imports: [UsersModule],
      providers: [
        AuthService,
        UsersService,
        { provide: appConfig.KEY, useValue: mockedAppConfig },
        { provide: jwtConfig.KEY, useValue: mockedJwtConfig },
        {
          provide: JwtService,
          useFactory: () => {
            return new JwtService({
              secret: mockedJwtConfig.accessSecret,
              signOptions: {
                expiresIn:
                  mockedJwtConfig.accessExpiresIn as JwtSignOptions['expiresIn'],
              },
            });
          },
        },
      ],
      entities: [User, Session],
    });

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    sessionRepository = module.get<Repository<Session>>(
      getRepositoryToken(Session),
    );

    const hashedPassword = await hash(
      password,
      mockedAppConfig.security.saltRounds,
    );
    await usersRepository.save([{ ...userData, hashedPassword }]);
  });

  describe('validateAndGetUser()', () => {
    it('should return matched user correctly', async () => {
      const actualResult = await service.validateAndGetUser(
        userData.email!,
        password,
      );
      const expectedResult = await usersRepository.findOneBy({
        email: userData.email!,
      });

      expect(actualResult).toEqual(
        expect.objectContaining({
          email: expectedResult?.email,
          firstName: expectedResult?.firstName,
          lastName: expectedResult?.lastName,
          roles: expectedResult?.roles,
        } as User),
      );
    });
  });

  describe('login()', () => {
    it('should return auth tokens', async () => {
      const user = (await usersRepository.findOneBy({ id: 1 })) as User;
      const actualResult = await service.login(user);

      expect(actualResult).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          accessExpiresInMs: msFn(
            mockedJwtConfig.accessExpiresIn as ms.StringValue,
          ),
          refreshToken: expect.any(String),
          refreshExpiresInMs: msFn(
            mockedJwtConfig.refreshExpiresIn as ms.StringValue,
          ),
        } as AuthTokens),
      );

      // verify access token
      const actualPayload = jwtService.verify(actualResult.accessToken);
      expect(actualPayload).toEqual(
        expect.objectContaining({
          sub: user.id,
          email: user.email,
        }),
      );
    });

    it('should invalidate existing session and replace by new session', async () => {
      const user = await usersRepository.findOneBy({ id: 1 });
      const existingHashedRefreshToken = 'existing_hashed_refresh_token';
      const existingExpiresAt = new Date();
      existingExpiresAt.setDate(existingExpiresAt.getDate() + 1);

      await sessionRepository.save({
        userId: 1,
        hashedRefreshToken: existingHashedRefreshToken,
        expiresAt: existingExpiresAt,
      });

      await service.login(user as User);

      const allValidSessions = await sessionRepository.findBy({
        userId: 1,
        expiresAt: MoreThan(new Date()),
      });
      expect(allValidSessions).toHaveLength(1);

      const latestValidSession = allValidSessions[0];
      expect(latestValidSession?.userId).toEqual(1);
      expect(latestValidSession?.hashedRefreshToken).not.toEqual(
        existingHashedRefreshToken,
      );
      expect(latestValidSession?.expiresAt).not.toEqual(existingExpiresAt);
    });
  });

  describe('refresh()', () => {
    const existingRefreshToken = 'existing_refresh_token';
    const existingHashedRefreshToken = createHash('sha256')
      .update(existingRefreshToken)
      .digest('hex');
    const existingExpiresAt = new Date();
    existingExpiresAt.setDate(existingExpiresAt.getDate() + 1);

    beforeEach(async () => {
      const existingRefreshToken = 'existing_refresh_token';
      const existingHashedRefreshToken = createHash('sha256')
        .update(existingRefreshToken)
        .digest('hex');
      const existingExpiresAt = new Date();
      existingExpiresAt.setDate(existingExpiresAt.getDate() + 1);

      await sessionRepository.save({
        userId: 1,
        hashedRefreshToken: existingHashedRefreshToken,
        expiresAt: existingExpiresAt,
      });
    });

    it('should return auth tokens', async () => {
      const actualResult = await service.refresh(existingRefreshToken);

      expect(actualResult).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          accessExpiresInMs: msFn(
            mockedJwtConfig.accessExpiresIn as ms.StringValue,
          ),
          refreshToken: expect.any(String),
          refreshExpiresInMs: msFn(
            mockedJwtConfig.refreshExpiresIn as ms.StringValue,
          ),
        } as AuthTokens),
      );

      // verify access token
      const user = (await usersRepository.findOneBy({ id: 1 })) as User;
      const actualPayload = jwtService.verify(actualResult.accessToken);
      expect(actualPayload).toEqual(
        expect.objectContaining({
          sub: user.id,
          email: user.email,
        }),
      );
    });

    it('should invalidate existing session and replace by new session', async () => {
      await service.refresh(existingRefreshToken);

      const allValidSessions = await sessionRepository.findBy({
        userId: 1,
        expiresAt: MoreThan(new Date()),
      });
      expect(allValidSessions).toHaveLength(1);

      const latestValidSession = allValidSessions[0];
      expect(latestValidSession?.userId).toEqual(1);
      expect(latestValidSession?.hashedRefreshToken).not.toEqual(
        existingHashedRefreshToken,
      );
      expect(latestValidSession?.expiresAt).not.toEqual(existingExpiresAt);
    });
  });
});
