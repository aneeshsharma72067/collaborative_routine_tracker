import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ritual } from '../rituals/entities/ritual.entity';
import { RitualSession } from '../ritual-sessions/entities/ritual-session.entity';
import { RitualStatus } from '../common/enums/ritual-status.enum';
import { RitualSessionStatus } from '../common/enums/session-status.enum';

@Injectable()
export class DashboardRepository {
  constructor(
    @InjectRepository(Ritual)
    private readonly ritualRepository: Repository<Ritual>,
    @InjectRepository(RitualSession)
    private readonly sessionRepository: Repository<RitualSession>,
  ) {}

  countActiveRituals(workspaceId: string) {
    return this.ritualRepository
      .createQueryBuilder('ritual')
      .innerJoin('ritual.team', 'team')
      .where('team.workspaceId = :workspaceId', { workspaceId })
      .andWhere('ritual.status = :status', { status: RitualStatus.ACTIVE })
      .getCount();
  }

  countUpcomingSessions(workspaceId: string, start: string, end: string) {
    return this.sessionRepository
      .createQueryBuilder('session')
      .innerJoin('session.ritual', 'ritual')
      .innerJoin('ritual.team', 'team')
      .where('team.workspaceId = :workspaceId', { workspaceId })
      .andWhere('session.status = :status', { status: RitualSessionStatus.OPEN })
      .andWhere('session.scheduledFor BETWEEN :start AND :end', {
        start,
        end,
      })
      .getCount();
  }

  countCompletedSessions(workspaceId: string) {
    return this.sessionRepository
      .createQueryBuilder('session')
      .innerJoin('session.ritual', 'ritual')
      .innerJoin('ritual.team', 'team')
      .where('team.workspaceId = :workspaceId', { workspaceId })
      .andWhere('session.status = :status', { status: RitualSessionStatus.CLOSED })
      .getCount();
  }
}
