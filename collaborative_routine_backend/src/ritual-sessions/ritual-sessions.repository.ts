import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, Repository } from 'typeorm';
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
      order: { scheduledFor: 'DESC' },
    });
  }

  findByRitualAndDate(ritualId: string, scheduledFor: string) {
    return this.repository.findOne({
      where: { ritualId, scheduledFor },
    });
  }

  findLatestForRitual(ritualId: string) {
    return this.repository.findOne({
      where: { ritualId },
      order: { scheduledFor: 'DESC' },
    });
  }

  findOpenSessionsBefore(dateISO: string) {
    return this.repository.find({
      where: {
        scheduledFor: LessThanOrEqual(dateISO),
        status: RitualSessionStatus.OPEN,
      },
    });
  }

  findUpcomingBetween(ritualId: string, startISO: string, endISO: string) {
    return this.repository.find({
      where: {
        ritualId,
        scheduledFor: Between(startISO, endISO),
      },
      order: { scheduledFor: 'ASC' },
    });
  }
}
