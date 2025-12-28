import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RitualSessionsService } from './ritual-sessions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../workspaces/guards/workspace.guard';
import { TeamGuard } from '../teams/guards/team.guard';

@Controller('workspaces/:workspaceId/teams/:teamId/rituals/:ritualId/sessions')
@ApiTags('sessions')
@UseGuards(JwtAuthGuard, WorkspaceGuard, TeamGuard)
export class RitualSessionsController {
  constructor(private readonly ritualSessionsService: RitualSessionsService) {}

  @Get()
  listSessions(
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
    @Param('ritualId') ritualId: string,
  ) {
    return this.ritualSessionsService.listSessions(workspaceId, teamId, ritualId);
  }

  @Get(':sessionId')
  getSession(
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
    @Param('ritualId') ritualId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.ritualSessionsService.getSession(
      workspaceId,
      teamId,
      ritualId,
      sessionId,
    );
  }
}
