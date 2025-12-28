import { Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RitualSessionsRepository } from './ritual-sessions.repository';
import { RitualsService } from '../rituals/rituals.service';
import { TeamsRepository } from '../teams/teams.repository';
import { RitualSessionStatus } from '../common/enums/session-status.enum';
import { RitualFrequency } from '../common/enums/ritual-frequency.enum';

@Injectable()
export class RitualSessionsService {
  constructor(
    private readonly ritualSessionsRepository: RitualSessionsRepository,
    private readonly ritualsService: RitualsService,
    private readonly teamsRepository: TeamsRepository,
  ) {}

  async listSessions(
    workspaceId: string,
    teamId: string,
    ritualId: string,
  ) {
    await this.ensureRitualContext(workspaceId, teamId, ritualId);
    return this.ritualSessionsRepository.listForRitual(ritualId);
  }

  async getSession(
    workspaceId: string,
    teamId: string,
    ritualId: string,
    sessionId: string,
  ) {
    await this.ensureRitualContext(workspaceId, teamId, ritualId);
    const session = await this.ritualSessionsRepository.findById(sessionId);
    if (!session || session.ritualId !== ritualId) {
      throw new NotFoundException('Ritual session not found');
    }
    return session;
  }

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async generateUpcomingSessions() {
    const rituals = await this.ritualsService.findActiveRituals();
    const todayISO = this.todayISO();

    for (const ritual of rituals) {
      const step =
        ritual.frequency === RitualFrequency.DAILY ? 1 : 7;
      const latest = await this.ritualSessionsRepository.findLatestForRitual(
        ritual.id,
      );

      let targetDate = latest
        ? this.shiftDate(latest.scheduledFor, step)
        : todayISO;

      if (targetDate < todayISO) {
        targetDate = todayISO;
      }

      const existing = await this.ritualSessionsRepository.findByRitualAndDate(
        ritual.id,
        targetDate,
      );

      if (!existing) {
        const session = this.ritualSessionsRepository.create({
          ritualId: ritual.id,
          scheduledFor: targetDate,
          status: RitualSessionStatus.OPEN,
        });
        await this.ritualSessionsRepository.save(session);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async closeExpiredSessions() {
    const todayISO = this.todayISO();
    const sessions = await this.ritualSessionsRepository.findOpenSessionsBefore(
      todayISO,
    );

    for (const session of sessions) {
      session.status = RitualSessionStatus.CLOSED;
      await this.ritualSessionsRepository.save(session);
    }
  }

  private async ensureRitualContext(
    workspaceId: string,
    teamId: string,
    ritualId: string,
  ) {
    const team = await this.teamsRepository.findById(teamId);
    if (!team || team.workspaceId !== workspaceId) {
      throw new NotFoundException('Team not found in workspace');
    }

    const ritual = await this.ritualsService.getRitual(ritualId);
    if (ritual.teamId !== teamId) {
      throw new NotFoundException('Ritual not found in team');
    }

    return { team, ritual };
  }

  private todayISO() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return today.toISOString().slice(0, 10);
  }

  private shiftDate(isoDate: string, days: number) {
    const date = new Date(isoDate);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }
}
