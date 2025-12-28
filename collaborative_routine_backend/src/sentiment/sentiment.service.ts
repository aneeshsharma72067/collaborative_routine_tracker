import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SentimentRepository } from './sentiment.repository';
import { TeamsRepository } from '../teams/teams.repository';
import { TeamMembersRepository } from '../teams/team-members.repository';
import { SubmitSentimentDto } from './dto/submit-sentiment.dto';

@Injectable()
export class SentimentService {
  constructor(
    private readonly sentimentRepository: SentimentRepository,
    private readonly teamsRepository: TeamsRepository,
    private readonly teamMembersRepository: TeamMembersRepository,
  ) {}

  async submitSnapshot(
    workspaceId: string,
    teamId: string,
    userId: string,
    dto: SubmitSentimentDto,
  ) {
    const team = await this.teamsRepository.findById(teamId);
    if (!team || team.workspaceId !== workspaceId) {
      throw new NotFoundException('Team not found in workspace context');
    }

    const membership = await this.teamMembersRepository.findMembership(
      teamId,
      userId,
    );

    if (!membership) {
      throw new ForbiddenException('Team membership required');
    }

    const weekStart = this.weekStartISO(new Date());

    const existing = await this.sentimentRepository.findByTeamUserWeek(
      teamId,
      userId,
      weekStart,
    );

    if (existing) {
      existing.score = dto.score;
      return this.sentimentRepository.save(existing);
    }

    const snapshot = this.sentimentRepository.create({
      teamId,
      userId,
      score: dto.score,
      weekStartDate: weekStart,
    });

    return this.sentimentRepository.save(snapshot);
  }

  async getTeamAverage(teamId: string) {
    const result = await this.sentimentRepository.getTeamAverage(teamId);
    if (!result || result.average === null) {
      return null;
    }
    return Number(result.average);
  }

  async getWorkspaceAverage(workspaceId: string) {
    const result = await this.sentimentRepository.getWorkspaceAverage(
      workspaceId,
    );
    if (!result || result.average === null) {
      return null;
    }
    return Number(result.average);
  }

  @Cron('0 1 * * 1')
  async resetUpcomingWindow() {
    const currentWeek = this.weekStartISO(new Date());
    await this.sentimentRepository.deleteSnapshotsAfter(currentWeek);
  }

  private weekStartISO(date: Date) {
    const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const day = result.getUTCDay();
    const diff = (day + 6) % 7; // Monday as start of week
    result.setUTCDate(result.getUTCDate() - diff);
    return result.toISOString().slice(0, 10);
  }
}
