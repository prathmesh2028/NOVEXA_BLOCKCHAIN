import { Injectable, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CasbinService } from '../../common/casbin/casbin.service';

export const ACTION_KEY = 'action';
export const RESOURCE_KEY = 'resource';

export const CasbinPolicy = (resource: string, action: string) => {
  return (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (key) {
      SetMetadata(RESOURCE_KEY, resource)(target, key, descriptor!);
      SetMetadata(ACTION_KEY, action)(target, key, descriptor!);
    } else {
      SetMetadata(RESOURCE_KEY, resource)(target);
      SetMetadata(ACTION_KEY, action)(target);
    }
  };
};

@Injectable()
export class CasbinGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly casbinService: CasbinService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.getAllAndOverride<string>(RESOURCE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const action = this.reflector.getAllAndOverride<string>(ACTION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.roles || user.roles.length === 0) {
      throw new ForbiddenException('User has no roles assigned for this action');
    }

    // Convert string roles like 'ADMIN' to 'ROLE_ADMIN' for Casbin group matching
    const casbinRoles = user.roles.map((role: string) => `ROLE_${role}`);
    
    // For REST conventions, fallback to HTTP method and path if action/resource are not explicitly set
    const reqAction = action || request.method;
    const reqResource = resource || request.route.path;

    const allowed = await this.casbinService.checkPermission(casbinRoles, reqResource, reqAction);
    
    if (!allowed) {
      throw new ForbiddenException(`Insufficient permissions to perform ${reqAction} on ${reqResource}`);
    }

    return true;
  }
}
