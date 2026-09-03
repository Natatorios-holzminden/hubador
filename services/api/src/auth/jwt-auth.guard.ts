import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { AUTH_PROVIDER, type AuthProvider } from './auth-provider';
import type { AuthedRequest } from './current-user';
import { IS_PUBLIC_KEY } from './public.decorator';

/**
 * Guard global. Verifica el Bearer token con el AuthProvider y carga el Profile
 * (con su rol) en `req.user`. El Profile ya existe: lo crea el registro.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(AUTH_PROVIDER) private readonly auth: AuthProvider,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Falta el header Authorization: Bearer <token>');
    }

    const authUser = await this.auth.verify(header.slice('Bearer '.length).trim());

    const profile = await this.prisma.profile.findUnique({
      where: { id: authUser.id },
      select: { id: true, email: true, role: true },
    });
    if (!profile) throw new UnauthorizedException('Usuario no encontrado');

    req.user = profile;
    return true;
  }
}
