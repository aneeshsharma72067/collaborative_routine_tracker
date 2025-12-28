import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RitualSessionsRepository } from './ritual-sessions.repository';
import { RitualsService } from '../rituals/rituals.service';
import { TeamsRepository } from '../teams/teams.repository';
import { RitualSessionStatus } from '../common/enums/session-status.enum';
import { RitualStatus } from '../common/enums/ritual-status.enum';
import { TeamMembersRepository } from '../teams/team-members.repository';
import { StartSessionDto } from './dto/start-session.dto';
import { RitualSession } from './entities/ritual-session.entity';

@Injectable()
export class RitualSessionsService {
  constructor(
    private readonly ritualSessionsRepository: RitualSessionsRepository,
    private readonly ritualsService: RitualsService,
    private readonly teamsRepository: TeamsRepository,
    private readonly teamMembersRepository: TeamMembersRepository,
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
    if (
      !session ||
      session.ritualId !== ritualId ||
      session.teamId !== teamId ||
      session.workspaceId !== workspaceId
    ) {
      throw new NotFoundException('Ritual session not found');
    }
    return session;
  }

  async startSession(
    workspaceId: string,
    teamId: string,
    ritualId: string,
    dto: StartSessionDto = {},
  ) {
    const { team, ritual } = await this.ensureRitualContext(
      workspaceId,
      teamId,
      ritualId,
    );

    if (ritual.status !== RitualStatus.ACTIVE) {
      throw new BadRequestException('Only active rituals can be started');
    }

    const existingOpen = await this.ritualSessionsRepository.findOpenByRitual(
      ritualId,
    );
    if (existingOpen) {
      throw new ConflictException('An open session already exists');
    }

    const expectedResponses = await this.teamMembersRepository.countByTeam(
      teamId,
    );

    const startedAt = new Date();
    const scheduledFor = dto?.scheduledFor
      ? new Date(dto.scheduledFor)
      : startedAt;

    if (Number.isNaN(scheduledFor.getTime())) {
      throw new BadRequestException('scheduledFor must be a valid ISO date');
    }

    const session = this.ritualSessionsRepository.create({
      workspaceId: team.workspaceId,
      teamId,
      ritualId,
      status: RitualSessionStatus.OPEN,
      scheduledFor,
      startedAt,
      responseCount: 0,
      expectedResponses,
    });

    return this.ritualSessionsRepository.save(session);
  }

  async closeSession(workspaceId: string, teamId: string, sessionId: string) {
    const session = await this.ensureSessionInTeam(
      workspaceId,
      teamId,
      sessionId,
    );

    if (session.status === RitualSessionStatus.CLOSED) {
      throw new BadRequestException('Session is already closed');
    }

    session.status = RitualSessionStatus.CLOSED;
    session.closedAt = new Date();
    return this.ritualSessionsRepository.save(session);
  }

  async incrementResponseCount(sessionId: string) {
    await this.ritualSessionsRepository.incrementResponseCount(sessionId);
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

  private async ensureSessionInTeam(
    workspaceId: string,
    teamId: string,
    sessionId: string,
  ): Promise<RitualSession> {
    const team = await this.teamsRepository.findById(teamId);
    if (!team || team.workspaceId !== workspaceId) {
      throw new NotFoundException('Team not found in workspace');
    }

    const session = await this.ritualSessionsRepository.findByTeamAndId(
      teamId,
      sessionId,
    );

    if (!session || session.workspaceId !== workspaceId) {
      throw new NotFoundException('Session not found for team');
    }

    return session;
  }
}
