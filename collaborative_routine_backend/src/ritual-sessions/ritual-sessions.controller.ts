import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RitualSessionsService } from './ritual-sessions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../workspaces/guards/workspace.guard';
import { TeamGuard } from '../teams/guards/team.guard';
import { TeamRoles } from '../teams/decorators/team-roles.decorator';
import { TeamRole } from '../common/enums/team-role.enum';
import { StartSessionDto } from './dto/start-session.dto';

@Controller('workspaces/:workspaceId/teams/:teamId/rituals/:ritualId/sessions')
@ApiTags('sessions')
@UseGuards(JwtAuthGuard, WorkspaceGuard, TeamGuard)
export class RitualSessionsController {
  constructor(private readonly ritualSessionsService: RitualSessionsService) {}

  @Post('start')
  @TeamRoles(TeamRole.LEAD)
  startSession(
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
    @Param('ritualId') ritualId: string,
    @Body() dto: StartSessionDto,
  ) {
    return this.ritualSessionsService.startSession(
      workspaceId,
      teamId,
      ritualId,
      dto,
    );
  }

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
