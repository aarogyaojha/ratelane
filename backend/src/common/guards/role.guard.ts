import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private requiredRole: string) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== this.requiredRole) {
      throw new ForbiddenException(
        `Access denied. This resource requires ${this.requiredRole} role.`,
      );
    }

    return true;
  }
}

export function RequireRole(role: string) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const guard = new RoleGuard(role);
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const context = args[args.length - 1] as ExecutionContext;
      if (!guard.canActivate(context)) {
        throw new ForbiddenException(`Access denied. Requires ${role} role.`);
      }
      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
