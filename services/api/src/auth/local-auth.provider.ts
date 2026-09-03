import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { AuthProvider, AuthUser } from './auth-provider';
import { TokenService } from './token.service';

/** Implementación de AuthProvider con JWT propio (HS256). */
@Injectable()
export class LocalAuthProvider implements AuthProvider {
  constructor(private readonly tokens: TokenService) {}

  async verify(token: string): Promise<AuthUser> {
    try {
      return this.tokens.verifyAccess(token);
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
