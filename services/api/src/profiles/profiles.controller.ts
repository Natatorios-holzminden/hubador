import { Body, Controller, Get, Patch } from '@nestjs/common';
import { profileUpdateSchema, type ProfileUpdate } from '@hubador/shared';
import { CurrentUser, type RequestUser } from '../auth/current-user';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { ProfilesService } from './profiles.service';

@Controller()
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  @Get('me')
  me(@CurrentUser() user: RequestUser) {
    return this.profiles.getById(user.id);
  }

  @Patch('me/profile')
  updateMe(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(profileUpdateSchema)) body: ProfileUpdate,
  ) {
    return this.profiles.update(user.id, body);
  }
}
