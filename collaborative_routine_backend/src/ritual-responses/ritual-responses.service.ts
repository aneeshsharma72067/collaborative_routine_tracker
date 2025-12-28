import { ForbiddenException, Injectable } from '@nestjs/common';
import { RitualResponsesRepository } from './ritual-responses.repository';
import { RitualSessionsService } from '../ritual-sessions/ritual-sessions.service';
import { SubmitRitualResponseDto } from './dto/submit-ritual-response.dto';
import { TeamMembersRepository } from '../teams/team-members.repository';
import { RitualSessionStatus } from '../common/enums/session-status.enum';

@Injectable()
export class RitualResponsesService {
  constructor(
    private readonly ritualResponsesRepository: RitualResponsesRepository,
    private readonly ritualSessionsService: RitualSessionsService,
    private readonly teamMembersRepository: TeamMembersRepository,
  ) {}

  async submitResponse(
    workspaceId: string,
    teamId: string,
    ritualId: string,
    sessionId: string,
    userId: string,
    dto: SubmitRitualResponseDto,
  ) {
    const session = await this.ritualSessionsService.getSession(
      workspaceId,
      teamId,
      ritualId,
      sessionId,
    );

    if (session.status === RitualSessionStatus.CLOSED) {
      throw new ForbiddenException('Session is closed for updates');
    }

    const membership = await this.teamMembersRepository.findMembership(
      teamId,
      userId,
    );

    if (!membership) {
      throw new ForbiddenException('Team membership required');
    }

    const existing = await this.ritualResponsesRepository.findBySessionAndUser(
      sessionId,
      userId,
    );

    if (existing) {
      existing.content = dto.content;
      return this.ritualResponsesRepository.save(existing);
    }

    const response = this.ritualResponsesRepository.create({
      sessionId,
      userId,
      content: dto.content,
    });

    return this.ritualResponsesRepository.save(response);
  }

  async listResponses(
    workspaceId: string,
    teamId: string,
    ritualId: string,
    sessionId: string,
  ) {
    await this.ritualSessionsService.getSession(
      workspaceId,
      teamId,
      ritualId,
      sessionId,
    );

    return this.ritualResponsesRepository.listBySession(sessionId);
  }
}
