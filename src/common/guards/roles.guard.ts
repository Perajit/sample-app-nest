import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/common/enums/user-role.enum';
import { ROLES_KEY } from 'src/common/constants/roles.constant';
import { AuthRequest } from 'src/modules/auth/interfaces/auth-request';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const req: AuthRequest = context.switchToHttp().getRequest();
    const userRoles = req.user.roles;

    const hasPermission = requiredRoles.some((requiredRole) =>
      userRoles.includes(requiredRole),
    );

    if (!hasPermission) {
      throw new ForbiddenException();
    }

    return true;
  }
}
