import { Injectable } from '@nestjs/common';
import type { Profile } from '@prisma/client';
import type { ProfileUpdate } from '@hubador/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfilesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Profile | null> {
    return this.prisma.profile.findUnique({ where: { id } });
  }

  update(id: string, data: ProfileUpdate): Promise<Profile> {
    return this.prisma.profile.update({ where: { id }, data });
  }
}
