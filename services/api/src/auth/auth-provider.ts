/** Seam de autenticación. Hoy lo implementa LocalAuthProvider (JWT propio).
 *  Para cambiar a un IdP externo (OAuth, etc.) sólo se cambia la implementación. */

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthProvider {
  /** Verifica el access token y devuelve el usuario, o lanza UnauthorizedException. */
  verify(token: string): Promise<AuthUser>;
}

export const AUTH_PROVIDER = Symbol('AUTH_PROVIDER');
