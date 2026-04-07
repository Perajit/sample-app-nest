import { PickType } from '@nestjs/mapped-types';
import { User } from '../../modules/users/entities/user.entity';

export class UserInfo extends PickType(User, [
  'id',
  'email',
  'firstName',
  'lastName',
  'roles',
] as const) {}
