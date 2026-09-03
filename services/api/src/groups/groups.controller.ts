import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  groupCreateSchema,
  groupJoinSchema,
  groupsQuerySchema,
  type GroupCreate,
  type GroupJoin,
  type GroupsQuery,
} from '@hubador/shared';
import { CurrentUser, type RequestUser } from '../auth/current-user';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { GroupsService } from './groups.service';

@Controller('groups')
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}

  @Get()
  list(@Query(new ZodValidationPipe(groupsQuerySchema)) query: GroupsQuery) {
    return this.groups.list(query);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  create(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(groupCreateSchema)) body: GroupCreate,
  ) {
    return this.groups.create(body, user.id);
  }

  @Post(':id/join')
  join(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(groupJoinSchema)) body: GroupJoin,
  ) {
    return this.groups.join(id, user.id, body);
  }
}
