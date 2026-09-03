import { Injectable, NotFoundException } from '@nestjs/common';
import type { Profile as SharedProfile, ProfileUpdate } from '@hubador/shared';
import type { Profile } from '@prisma/client';
import { ProfilesRepository } from './profiles.repository';

@Injectable()
export class ProfilesService {
  constructor(private readonly repo: ProfilesRepository) {}

  async getById(id: string): Promise<SharedProfile> {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException('Perfil no encontrado');
    return toShared(row);
  }

  async update(id: string, dto: ProfileUpdate): Promise<SharedProfile> {
    return toShared(await this.repo.update(id, dto));
  }
}

function toShared(p: Profile): SharedProfile {
  return {
    id: p.id,
    email: p.email,
    nombre: p.nombre ?? undefined,
    barrio: p.barrio ?? undefined,
    telefono: p.telefono ?? undefined,
    direccion: p.direccion ?? undefined,
    lat: p.lat ?? undefined,
    lng: p.lng ?? undefined,
    role: p.role,
  };
}
