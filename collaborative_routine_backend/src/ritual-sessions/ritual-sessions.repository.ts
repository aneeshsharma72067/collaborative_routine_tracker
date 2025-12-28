import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RitualSession } from './entities/ritual-session.entity';
import { RitualSessionStatus } from '../common/enums/session-status.enum';

@Injectable()
export class RitualSessionsRepository {
  constructor(
    @InjectRepository(RitualSession)
    private readonly repository: Repository<RitualSession>,
  ) {}

  create(payload: Partial<RitualSession>) {
    return this.repository.create(payload);
  }

  save(session: RitualSession) {
    return this.repository.save(session);
  }

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  listForRitual(ritualId: string) {
    return this.repository.find({
      where: { ritualId },
      order: { startedAt: 'DESC', createdAt: 'DESC' },
    });
  }

  findOpenByRitual(ritualId: string) {
    return this.repository.findOne({
      where: { ritualId, status: RitualSessionStatus.OPEN },
      order: { startedAt: 'DESC' },
    });
  }

  findByTeamAndId(teamId: string, sessionId: string) {
    return this.repository.findOne({
      where: { id: sessionId, teamId },
    });
  }

  incrementResponseCount(sessionId: string) {
    return this.repository.increment({ id: sessionId }, 'responseCount', 1);
  }
}
