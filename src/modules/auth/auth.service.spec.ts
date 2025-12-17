import { UserRole } from 'src/common/enums/user-role.enum';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { hash } from 'bcrypt';
import { Repository } from 'typeorm';
import {
  createTestingModule,
  mockedAppConfig,
  mockedJwtConfig,
} from 'src/test-utils';
import appConfig from 'src/config/app.config';
import jwtConfig from 'src/config/jwt.config';
import { User } from 'src/modules/users/entities/user.entity';
import { UsersModule } from 'src/modules/users/users.module';
import { UsersService } from 'src/modules/users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: Repository<User>;

  const userData: Partial<User> = {
    email: 'user@mail.com',
    firstName: 'First',
    lastName: 'Last',
    roles: [UserRole.ADMIN],
  };
  const password = 'pwd';

  beforeEach(async () => {
    const module = await createTestingModule({
      imports: [
        UsersModule,
        JwtModule.register({
          secret: mockedJwtConfig.accessSecret,
          signOptions: {
            expiresIn: mockedJwtConfig.accessExpiresIn,
          },
        } as JwtModuleOptions),
      ],
      providers: [
        AuthService,
        UsersService,
        { provide: appConfig.KEY, useValue: mockedAppConfig },
        { provide: jwtConfig.KEY, useValue: mockedJwtConfig },
      ],
      entities: [User],
    });

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));

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
        }),
      );
    });
  });
});
