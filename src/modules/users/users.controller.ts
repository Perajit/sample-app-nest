import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { MutationResponseDto } from 'src/common/dto/mutation-response.dto';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { AuthRequest } from 'src/modules/auth/interfaces/auth-request';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUsersDto } from './dto/get-users.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUsers(
    @Query()
    dto: GetUsersDto,
  ): Promise<User[]> {
    return this.usersService.getUsers(dto);
  }

  @Get(':id')
  async getUserById(
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<User | null> {
    return this.usersService.getUserById(id);
  }

  @Roles(UserRole.ADMIN)
  @Post()
  async createUser(
    @Request()
    req: AuthRequest,

    @Body()
    dto: CreateUserDto,
  ): Promise<MutationResponseDto> {
    return this.usersService.createUser(req.user.email, dto);
  }

  @Roles(UserRole.ADMIN)
  @Put(':id')
  async updateUser(
    @Request()
    req: AuthRequest,

    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateUserDto,
  ): Promise<MutationResponseDto> {
    console.log({ user: req.user });
    return this.usersService.updateUser(req.user.email, id, dto);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async softDeleteUser(
    @Request()
    req: AuthRequest,

    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<MutationResponseDto> {
    return this.usersService.softDeleteUser(req.user.email, id);
  }
}
