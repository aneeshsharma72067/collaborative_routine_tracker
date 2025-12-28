import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RitualsRepository } from './rituals.repository';
import { TeamsRepository } from '../teams/teams.repository';
import { TeamMembersRepository } from '../teams/team-members.repository';
import { CreateRitualDto } from './dto/create-ritual.dto';
import { RitualStatus } from '../common/enums/ritual-status.enum';
import { Ritual } from './entities/ritual.entity';
import { TeamRole } from '../common/enums/team-role.enum';
import { UpdateRitualStatusDto } from './dto/update-ritual-status.dto';

@Injectable()
export class RitualsService {
  constructor(
    private readonly ritualsRepository: RitualsRepository,
    private readonly teamsRepository: TeamsRepository,
    private readonly teamMembersRepository: TeamMembersRepository,
  ) {}

  async createRitual(
    workspaceId: string,
    teamId: string,
    ownerId: string,
    dto: CreateRitualDto,
  ) {
    await this.ensureTeamInWorkspace(workspaceId, teamId);
    await this.ensureLeadRole(teamId, ownerId);

    const ritual = this.ritualsRepository.create({
      teamId,
      ownerId,
      name: dto.name,
      type: dto.type,
      frequency: dto.frequency,
      status: RitualStatus.ACTIVE,
    });

    return this.ritualsRepository.save(ritual);
  }

  async listRituals(workspaceId: string, teamId: string) {
    await this.ensureTeamInWorkspace(workspaceId, teamId);
    return this.ritualsRepository.listByTeam(teamId);
  }

  async updateStatus(
    workspaceId: string,
    teamId: string,
    ritualId: string,
    ownerId: string,
    dto: UpdateRitualStatusDto,
  ) {
    await this.ensureTeamInWorkspace(workspaceId, teamId);
    await this.ensureLeadRole(teamId, ownerId);

    const ritual = await this.getRitual(ritualId);
    if (ritual.teamId !== teamId) {
      throw new ForbiddenException('Ritual does not belong to the team');
    }

    ritual.status = dto.status;
    return this.ritualsRepository.save(ritual);
  }

  async getRitual(ritualId: string) {
    const ritual = await this.ritualsRepository.findById(ritualId);
    if (!ritual) {
      throw new NotFoundException('Ritual not found');
    }
    return ritual;
  }

  findActiveRituals() {
    return this.ritualsRepository.findActive();
  }

  private async ensureTeamInWorkspace(workspaceId: string, teamId: string) {
    const team = await this.teamsRepository.findById(teamId);
    if (!team || team.workspaceId !== workspaceId) {
      throw new NotFoundException('Team not found in workspace context');
    }
    return team;
  }

  private async ensureLeadRole(teamId: string, userId: string) {
    const membership = await this.teamMembersRepository.findMembership(
      teamId,
      userId,
    );

    if (!membership || membership.role !== TeamRole.LEAD) {
      throw new ForbiddenException('Team lead permissions required');
    }
  }
}
