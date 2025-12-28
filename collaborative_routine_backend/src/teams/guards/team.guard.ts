import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TeamsRepository } from '../teams.repository';
import { TeamMembersRepository } from '../team-members.repository';
import { TEAM_ROLES_KEY } from '../decorators/team-roles.decorator';
import { TeamRole } from '../../common/enums/team-role.enum';
import { RequestUser } from '../../common/types';

@Injectable()
export class TeamGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly teamsRepository: TeamsRepository,
    private readonly teamMembersRepository: TeamMembersRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user: RequestUser | undefined = request.user;
    const workspaceId: string | undefined = request.params?.workspaceId;
    const teamId: string | undefined = request.params?.teamId;

    if (!user?.sub) {
      throw new ForbiddenException('Authentication required');
    }

    if (!workspaceId) {
      throw new BadRequestException('workspaceId parameter is required');
    }

    if (!teamId) {
      throw new BadRequestException('teamId parameter is required');
    }

    const team = await this.teamsRepository.findById(teamId);

    if (!team || team.workspaceId !== workspaceId) {
      throw new ForbiddenException('Team access denied');
    }

    const membership = await this.teamMembersRepository.findMembership(
      teamId,
      user.sub,
    );

    if (!membership) {
      throw new ForbiddenException('Team membership required');
    }

    const requiredRoles = this.reflector.getAllAndOverride<TeamRole[]>(
      TEAM_ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (requiredRoles?.length && !requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('Insufficient team role');
    }

    request.team = team;
    request.teamMembership = membership;
    return true;
  }
}
