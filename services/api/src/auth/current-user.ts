import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Role } from '@prisma/client';
import type { Request } from 'express';

/** Usuario ya resuelto por JwtAuthGuard (incluye el rol desde la tabla profiles). */
export interface RequestUser {
  id: string;
  email: string;
  role: Role;
}

export type AuthedRequest = Request & { user?: RequestUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    if (!req.user) throw new Error('CurrentUser usado en una ruta sin JwtAuthGuard');
    return req.user;
  },
);
