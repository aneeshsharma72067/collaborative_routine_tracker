import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { TeamsRepository } from './teams.repository';
import { TeamMembersRepository } from './team-members.repository';
import { WorkspaceMembersRepository } from '../workspaces/workspace-members.repository';
import { CreateTeamDto } from './dto/create-team.dto';
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';
import { TeamRole } from '../common/enums/team-role.enum';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { WorkspacesRepository } from '../workspaces/workspaces.repository';

@Injectable()
export class TeamsService {
  constructor(
    private readonly teamsRepository: TeamsRepository,
    private readonly teamMembersRepository: TeamMembersRepository,
    private readonly workspaceMembersRepository: WorkspaceMembersRepository,
    private readonly workspacesRepository: WorkspacesRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createTeam(
    workspaceId: string,
    createdBy: string,
    dto: CreateTeamDto,
  ) {
    await this.ensureWorkspaceExists(workspaceId);

    const leadMembership =
      await this.workspaceMembersRepository.findMembership(
        workspaceId,
        dto.leadUserId,
      );

    if (!leadMembership) {
      throw new NotFoundException('Lead user must belong to the workspace');
    }

    let team: Team | null = null;

    await this.dataSource.transaction(async (manager) => {
      const teamRepo = manager.getRepository(Team);
      const membershipRepo = manager.getRepository(TeamMember);

      team = teamRepo.create({
        name: dto.name,
        workspaceId,
      });

      await teamRepo.save(team!);

      const lead = membershipRepo.create({
        teamId: team!.id,
        userId: dto.leadUserId,
        role: TeamRole.LEAD,
      });

      await membershipRepo.save(lead);

      if (dto.leadUserId !== createdBy) {
        const creatorMembership = await membershipRepo.findOne({
          where: {
            teamId: team!.id,
            userId: createdBy,
          },
        });

        if (!creatorMembership) {
          const creator = membershipRepo.create({
            teamId: team!.id,
            userId: createdBy,
            role: TeamRole.MEMBER,
          });
          await membershipRepo.save(creator);
        }
      }
    });

    return this.teamsRepository.findById(team!.id);
  }

  listTeams(workspaceId: string) {
    return this.teamsRepository.listByWorkspace(workspaceId);
  }

  async addMember(
    workspaceId: string,
    teamId: string,
    dto: AddTeamMemberDto,
  ) {
    const team = await this.getTeam(workspaceId, teamId);

    const workspaceMembership =
      await this.workspaceMembersRepository.findMembership(
        workspaceId,
        dto.userId,
      );

    if (!workspaceMembership) {
      throw new NotFoundException('User must belong to the workspace');
    }

    const existingMember = await this.teamMembersRepository.findMembership(
      team.id,
      dto.userId,
    );

    if (existingMember) {
      throw new ConflictException('User is already part of this team');
    }

    const member = this.teamMembersRepository.create({
      teamId: team.id,
      userId: dto.userId,
      role: dto.role,
    });

    await this.teamMembersRepository.save(member);

    return this.teamMembersRepository.findMembership(team.id, dto.userId);
  }

  listMembers(teamId: string) {
    return this.teamMembersRepository.listMembers(teamId);
  }

  async getTeam(workspaceId: string, teamId: string) {
    const team = await this.teamsRepository.findById(teamId);
    if (!team || team.workspaceId !== workspaceId) {
      throw new NotFoundException('Team not found in workspace');
    }
    return team;
  }

  private async ensureWorkspaceExists(workspaceId: string) {
    const workspace = await this.workspacesRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
  }
}
