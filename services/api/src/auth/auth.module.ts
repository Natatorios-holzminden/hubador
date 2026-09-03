import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AUTH_PROVIDER } from './auth-provider';
import { AuthService } from './auth.service';
import { LocalAuthProvider } from './local-auth.provider';
import { RolesGuard } from './roles.guard';
import { TokenService } from './token.service';

@Global()
@Module({
  controllers: [AuthController],
  providers: [
    TokenService,
    AuthService,
    { provide: AUTH_PROVIDER, useClass: LocalAuthProvider },
    RolesGuard,
  ],
  exports: [AUTH_PROVIDER, RolesGuard],
})
export class AuthModule {}
