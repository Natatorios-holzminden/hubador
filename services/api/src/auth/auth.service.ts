import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthSession, Login, Register } from '@hubador/shared';
import type { Profile } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword, verifyPassword } from './password';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
  ) {}

  async register(dto: Register, userAgent?: string): Promise<AuthSession> {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.profile.findUnique({ where: { email } });
    if (existing?.passwordHash) {
      throw new ConflictException('Ese email ya está registrado');
    }
    const passwordHash = await hashPassword(dto.password);
    const profile = existing
      ? await this.prisma.profile.update({
          where: { id: existing.id },
          data: { passwordHash, nombre: dto.nombre ?? existing.nombre },
        })
      : await this.prisma.profile.create({
          data: { email, passwordHash, nombre: dto.nombre ?? null },
        });
    return this.session(profile, userAgent);
  }

  async login(dto: Login, userAgent?: string): Promise<AuthSession> {
    const email = dto.email.toLowerCase().trim();
    const profile = await this.prisma.profile.findUnique({ where: { email } });
    if (!profile?.passwordHash || !(await verifyPassword(dto.password, profile.passwordHash))) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }
    return this.session(profile, userAgent);
  }

  async refresh(rawRefresh: string, userAgent?: string): Promise<AuthSession> {
    const { userId, refreshToken } = await this.tokens.rotateRefresh(rawRefresh, userAgent);
    const profile = await this.prisma.profile.findUniqueOrThrow({ where: { id: userId } });
    return {
      accessToken: this.tokens.signAccess(profile),
      refreshToken,
      user: publicUser(profile),
    };
  }

  async logout(rawRefresh: string): Promise<{ ok: true }> {
    await this.tokens.revoke(rawRefresh);
    return { ok: true };
  }

  private async session(profile: Profile, userAgent?: string): Promise<AuthSession> {
    return {
      accessToken: this.tokens.signAccess(profile),
      refreshToken: await this.tokens.issueRefresh(profile.id, userAgent),
      user: publicUser(profile),
    };
  }
}

function publicUser(p: Profile): AuthSession['user'] {
  return { id: p.id, email: p.email, nombre: p.nombre ?? undefined, role: p.role };
}
