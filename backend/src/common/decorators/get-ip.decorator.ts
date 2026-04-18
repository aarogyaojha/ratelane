import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetIpAddress = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.ip || request.connection.remoteAddress || 'unknown';
  },
);
