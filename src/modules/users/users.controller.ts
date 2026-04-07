import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { RolesGuard } from 'src/common/guards/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { AuthRequest } from 'src/modules/auth/interfaces/auth-request';
import { UserInfo } from '../../common/models/user-info.model';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto } from './dto/get-users.dto';
import { UpdateUserResponse } from './dto/updaet-user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(
    @Request()
    req: AuthRequest,
  ): Promise<UserInfo | null> {
    const user = await this.usersService.getUserById(req.user.id);
    return user ? this.usersService.toPublic(user) : null;
  }

  @Roles(UserRole.ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  async getUsers(
    @Query()
    dto: GetUsersDto,
  ): Promise<UserInfo[]> {
    const users = await this.usersService.getUsers(dto);
    return users.map((user) => this.usersService.toPublic(user));
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getUserById(
    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<UserInfo | null> {
    const user = await this.usersService.getUserById(id);
    return user ? this.usersService.toPublic(user) : null;
  }

  @Roles(UserRole.ADMIN)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Request()
    req: AuthRequest,

    @Body()
    dto: CreateUserDto,
  ): Promise<UserInfo> {
    const user = await this.usersService.createUser(req.user.email, dto);
    return this.usersService.toPublic(user);
  }

  @Roles(UserRole.ADMIN)
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async updateUser(
    @Request()
    req: AuthRequest,

    @Param('id', ParseIntPipe)
    id: number,

    @Body()
    dto: UpdateUserDto,
  ): Promise<UpdateUserResponse> {
    await this.usersService.updateUser(req.user.email, id, dto);
    return { id, ...dto };
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDeleteUser(
    @Request()
    req: AuthRequest,

    @Param('id', ParseIntPipe)
    id: number,
  ): Promise<void> {
    return this.usersService.softDeleteUser(req.user.email, id);
  }
}
