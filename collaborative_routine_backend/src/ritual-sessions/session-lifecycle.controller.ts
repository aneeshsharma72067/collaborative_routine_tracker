import { Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RitualSessionsService } from './ritual-sessions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../workspaces/guards/workspace.guard';
import { TeamGuard } from '../teams/guards/team.guard';
import { TeamRoles } from '../teams/decorators/team-roles.decorator';
import { TeamRole } from '../common/enums/team-role.enum';

@Controller('workspaces/:workspaceId/teams/:teamId')
@ApiTags('sessions')
@UseGuards(JwtAuthGuard, WorkspaceGuard, TeamGuard)
export class SessionLifecycleController {
  constructor(private readonly ritualSessionsService: RitualSessionsService) {}

  @Patch('sessions/:sessionId/close')
  @TeamRoles(TeamRole.LEAD)
  closeSession(
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.ritualSessionsService.closeSession(
      workspaceId,
      teamId,
      sessionId,
    );
  }
}
