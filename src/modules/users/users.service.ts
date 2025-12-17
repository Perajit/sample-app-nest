import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { hash } from 'bcrypt';
import appConfig from 'src/config/app.config';
import { MutationResponseDto } from 'src/common/dto/mutation-response.dto';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(appConfig.KEY)
    private appConfigValues: ConfigType<typeof appConfig>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUsers(dto: GetUsersDto): Promise<User[]> {
    const { keyword, page = 1, limit = 10 } = dto;

    const whereConditions = keyword
      ? [
          { email: ILike(`%${keyword}%`) },
          { firstName: ILike(`%${keyword}%`) },
          { lastName: ILike(`%${keyword}%`) },
        ]
      : undefined;

    return await this.userRepository.find({
      where: whereConditions,
      skip: limit * (page - 1),
      take: limit,
    });
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      withDeleted: false,
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      withDeleted: false,
    });
  }

  async createUser(
    by: string,
    dto: CreateUserDto,
  ): Promise<MutationResponseDto> {
    await this.validateUserUniqueness(dto.email);

    const hashedPassword = await this.hashPassword(dto.password);

    await this.userRepository.save({
      email: dto.email,
      hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roles: dto.roles || [UserRole.USER],
      createdBy: by,
      updatedBy: by,
    });

    return {
      status: 'success',
      message: 'User created successfully',
    };
  }

  async updateUser(
    by: string,
    id: number,
    dto: UpdateUserDto,
  ): Promise<MutationResponseDto> {
    await this.validateUserExistance(id);

    const hashedPassword = await this.hashPassword(dto.password);

    await this.userRepository.update(id, {
      hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roles: dto.roles,
      updatedBy: by,
    });

    return {
      status: 'success',
      message: 'User deleted successfully',
    };
  }

  async softDeleteUser(by: string, id: number): Promise<MutationResponseDto> {
    await this.validateUserExistance(id);

    await this.userRepository.update(id, {
      deletedAt: new Date(),
      deletedBy: by,
    });

    return {
      status: 'success',
      message: 'User deleted successfully',
    };
  }

  private async validateUserUniqueness(email: string) {
    const existingUser = await this.getUserByEmail(email);

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }
  }

  private async validateUserExistance(id: number): Promise<User> {
    const existingUser = await this.getUserById(id);

    if (!existingUser) {
      throw new BadRequestException('User does not exists');
    }

    return existingUser;
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = this.appConfigValues.security.saltRounds;
    return hash(password, saltRounds);
  }
}
