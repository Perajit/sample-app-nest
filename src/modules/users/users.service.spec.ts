import { createTestingModule, mockedAppConfig } from 'src/test-utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { GetUsersDto } from './dto/get-users.dto';
import { CreateUserDto } from './dto/create-user.dto';
import appConfig from 'src/config/app.config';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<User>;

  const usersData: Partial<User>[] = [
    {
      email: 'user1@mail.com',
      hashedPassword: 'hashed-pwd1',
      firstName: 'First1',
      lastName: 'Last1',
      roles: [UserRole.ADMIN],
    },
    {
      email: 'user2@mail.com',
      hashedPassword: 'hashed-pwd2',
      firstName: 'First2',
      lastName: 'Last2',
      roles: [UserRole.USER],
    },
    {
      email: 'user3@mail.com',
      hashedPassword: 'hashed-pwd3',
      firstName: 'First3',
      lastName: 'Last3',
      roles: [UserRole.USER],
    },
    {
      email: 'user4@mail.com',
      hashedPassword: 'hashed-pwd4',
      firstName: 'First4',
      lastName: 'Last4',
      roles: [UserRole.USER],
    },
    {
      email: 'user5@mail.com',
      hashedPassword: 'hashed-pwd5',
      firstName: 'First5',
      lastName: 'Last5',
      roles: [UserRole.USER],
    },
    {
      email: 'user6@mail.com',
      hashedPassword: 'hashed-pwd6',
      firstName: 'First6',
      lastName: 'Last6',
      roles: [UserRole.USER],
    },
    {
      email: 'user7@mail.com',
      hashedPassword: 'hashed-pwd7',
      firstName: 'First7',
      lastName: 'Last7',
      roles: [UserRole.USER],
    },
    {
      email: 'user8@mail.com',
      hashedPassword: 'hashed-pwd8',
      firstName: 'First8',
      lastName: 'Last8',
      roles: [UserRole.USER],
    },
    {
      email: 'user9@mail.com',
      hashedPassword: 'hashed-pwd9',
      firstName: 'First9',
      lastName: 'Last9',
      roles: [UserRole.USER],
    },
    {
      email: 'user10@mail.com',
      hashedPassword: 'hashed-pwd10',
      firstName: 'First10',
      lastName: 'Last10',
      roles: [UserRole.USER],
    },
    {
      email: 'user11@mail.com',
      hashedPassword: 'hashed-pwd11',
      firstName: 'First11',
      lastName: 'Last11',
      roles: [UserRole.USER],
    },
    {
      email: 'user12@mail.com',
      hashedPassword: 'hashed-pwd12',
      firstName: 'First12',
      lastName: 'Last12',
      roles: [UserRole.USER],
    },
    {
      email: 'user13@mail.com',
      hashedPassword: 'hashed-pwd13',
      firstName: 'First13',
      lastName: 'Last13',
      roles: [UserRole.USER],
    },
  ];

  const mapDataToMatcher = (user: Partial<User>) =>
    expect.objectContaining({
      email: user.email,
      hashedPassword: user.hashedPassword,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
    }) as User;

  beforeEach(async () => {
    const module = await createTestingModule({
      providers: [
        UsersService,
        { provide: appConfig.KEY, useValue: mockedAppConfig },
      ],
      entities: [User],
    });

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));

    await usersRepository.save(usersData);
  });

  describe('getUsres()', () => {
    const testCases = [
      {
        name: '#1',
        dto: {},
        expectedResult: usersData.slice(0, 10).map(mapDataToMatcher),
      },
      {
        name: '#2',
        dto: { page: 2, limit: 5 },
        expectedResult: usersData.slice(5, 10).map(mapDataToMatcher),
      },
      {
        name: '#6',
        dto: { keyword: 'user1', page: 2, limit: 2 },
        expectedResult: [usersData[10], usersData[11]].map(mapDataToMatcher),
      },
      {
        name: '#3',
        dto: { keyword: 'User1' },
        expectedResult: [
          usersData[0],
          usersData[9],
          usersData[10],
          usersData[11],
          usersData[12],
        ].map(mapDataToMatcher),
      },
      {
        name: '#4',
        dto: { keyword: 'first10' },
        expectedResult: [usersData[9]].map(mapDataToMatcher),
      },
      {
        name: '#5',
        dto: { keyword: 'last11' },
        expectedResult: [usersData[10]].map(mapDataToMatcher),
      },
      {
        name: '#7',
        dto: { keyword: 'pwd' },
        expectedResult: [],
      },
    ] as {
      name: string;
      dto: GetUsersDto;
      expectedResult: User[];
    }[];

    testCases.forEach(({ name, dto, expectedResult }) => {
      it(`should return users correctly for case ${name}`, async () => {
        const actualResult = await service.getUsers(dto);

        expect(actualResult.length).toEqual(expectedResult.length);
        expect(actualResult).toEqual(expect.arrayContaining(expectedResult));
      });
    });
  });

  describe('getUserById()', () => {
    it('should return user correctly', async () => {
      const actualResult = await service.getUserById(2);
      const expectedResult = mapDataToMatcher(usersData[1]);

      expect(actualResult).toEqual(expectedResult);
    });

    it('should return null when user does not exist', async () => {
      const actualResult = await service.getUserById(20);

      expect(actualResult).toEqual(null);
    });
  });

  describe('getUserByEmail()', () => {
    it('should return user correctly', async () => {
      const actualResult = await service.getUserByEmail('user2@mail.com');
      const expectedResult = mapDataToMatcher(usersData[1]);

      expect(actualResult).toEqual(expectedResult);
    });

    it('should return null when user does not exist', async () => {
      const actualResult = await service.getUserByEmail('not-exist@mail.com');

      expect(actualResult).toEqual(null);
    });
  });

  describe('createUser()', () => {
    const dto: CreateUserDto = {
      email: 'new-user@mail.com',
      password: 'pwd',
      firstName: 'First',
      lastName: 'Last',
      roles: [UserRole.ADMIN],
    };

    it('should insert user correctly', async () => {
      await service.createUser('test', dto);

      const [users, count] = await usersRepository.findAndCount();
      expect(count).toEqual(usersData.length + 1);

      const createdUser = users[count - 1];

      expect(createdUser).toEqual(
        expect.objectContaining({
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          roles: dto.roles,
          createdBy: 'test',
          updatedBy: 'test',
        }),
      );

      const isMatched = await compare(dto.password, createdUser.hashedPassword);
      expect(isMatched).toBe(true);
    });
  });

  describe('updateUser()', () => {
    const dto: UpdateUserDto = {
      password: 'pwd',
      firstName: 'First',
      lastName: 'Last',
      roles: [UserRole.ADMIN],
    };

    it('should update user correctly', async () => {
      await service.updateUser('test', 2, dto);

      const [users, count] = await usersRepository.findAndCount();
      expect(count).toEqual(usersData.length);

      const updatedUser = users[1];

      expect(updatedUser).toEqual(
        expect.objectContaining({
          firstName: dto.firstName,
          lastName: dto.lastName,
          roles: dto.roles,
          updatedBy: 'test',
        }),
      );

      const isMatched = await compare(dto.password, updatedUser.hashedPassword);
      expect(isMatched).toBe(true);
    });
  });

  describe('softDeleteUser()', () => {
    it('should update user correctly', async () => {
      await service.softDeleteUser('test', 2);

      const [users, count] = await usersRepository.findAndCount();
      expect(count).toEqual(usersData.length - 1);

      const deletedUserIndex = users.findIndex((user) => user.id === 2);
      expect(deletedUserIndex).toBe(-1);
    });
  });
});
