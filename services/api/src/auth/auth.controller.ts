import { Body, Controller, Post, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  loginSchema,
  refreshSchema,
  registerSchema,
  type Login,
  type Refresh,
  type Register,
} from '@hubador/shared';
import type { Request } from 'express';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('register')
  register(@Body(new ZodValidationPipe(registerSchema)) body: Register, @Req() req: Request) {
    return this.auth.register(body, req.get('user-agent') ?? undefined);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('login')
  login(@Body(new ZodValidationPipe(loginSchema)) body: Login, @Req() req: Request) {
    return this.auth.login(body, req.get('user-agent') ?? undefined);
  }

  @Public()
  @Post('refresh')
  refresh(@Body(new ZodValidationPipe(refreshSchema)) body: Refresh, @Req() req: Request) {
    return this.auth.refresh(body.refreshToken, req.get('user-agent') ?? undefined);
  }

  @Public()
  @Post('logout')
  logout(@Body(new ZodValidationPipe(refreshSchema)) body: Refresh) {
    return this.auth.logout(body.refreshToken);
  }
}
