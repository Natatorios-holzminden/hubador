import { createHash, randomBytes } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';
import type { Env } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from './auth-provider';

const ISSUER = 'hubador';

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

@Injectable()
export class TokenService {
  private readonly secret: string;
  private readonly accessTtl: string;
  private readonly refreshTtlMs: number;

  constructor(
    config: ConfigService<Env, true>,
    private readonly prisma: PrismaService,
  ) {
    this.secret = config.get('JWT_SECRET', { infer: true });
    this.accessTtl = config.get('JWT_ACCESS_TTL', { infer: true });
    this.refreshTtlMs = config.get('JWT_REFRESH_TTL_DAYS', { infer: true }) * 86_400_000;
  }

  signAccess(user: { id: string; email: string }): string {
    return jwt.sign({ email: user.email }, this.secret, {
      subject: user.id,
      issuer: ISSUER,
      expiresIn: this.accessTtl,
    } as jwt.SignOptions);
  }

  verifyAccess(token: string): AuthUser {
    const decoded = jwt.verify(token, this.secret, { issuer: ISSUER });
    if (typeof decoded === 'string' || !decoded.sub) {
      throw new UnauthorizedException('Token inválido');
    }
    const email = 'email' in decoded && typeof decoded.email === 'string' ? decoded.email : '';
    return { id: String(decoded.sub), email };
  }

  async issueRefresh(userId: string, userAgent?: string): Promise<string> {
    const raw = randomBytes(48).toString('base64url');
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: sha256(raw),
        expiresAt: new Date(Date.now() + this.refreshTtlMs),
        userAgent: userAgent?.slice(0, 250),
      },
    });
    return raw;
  }

  /** Valida el refresh token, lo revoca y emite uno nuevo (rotación). */
  async rotateRefresh(raw: string, userAgent?: string): Promise<{ userId: string; refreshToken: string }> {
    const row = await this.prisma.refreshToken.findUnique({ where: { tokenHash: sha256(raw) } });
    if (!row || row.revokedAt || row.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
    await this.prisma.refreshToken.update({
      where: { id: row.id },
      data: { revokedAt: new Date() },
    });
    const refreshToken = await this.issueRefresh(row.userId, userAgent);
    return { userId: row.userId, refreshToken };
  }

  async revoke(raw: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: sha256(raw), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
