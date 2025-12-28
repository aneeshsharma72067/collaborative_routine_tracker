import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ritual } from './entities/ritual.entity';
import { RitualStatus } from '../common/enums/ritual-status.enum';

@Injectable()
export class RitualsRepository {
  constructor(
    @InjectRepository(Ritual)
    private readonly repository: Repository<Ritual>,
  ) {}

  create(payload: Partial<Ritual>) {
    return this.repository.create(payload);
  }

  save(ritual: Ritual) {
    return this.repository.save(ritual);
  }

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  listByTeam(teamId: string) {
    return this.repository.find({ where: { teamId } });
  }

  findActive() {
    return this.repository.find({ where: { status: RitualStatus.ACTIVE } });
  }
}
