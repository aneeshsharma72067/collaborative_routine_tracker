import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RitualSessionsService } from './ritual-sessions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../workspaces/guards/workspace.guard';
import { TeamGuard } from '../teams/guards/team.guard';
import { AllowTeamGuests } from '../teams/decorators/team-access.decorator';
import { StartSessionDto } from './dto/start-session.dto';
import { WorkspaceOwnerGuard } from '../workspaces/guards/workspace-owner.guard';

@Controller('workspaces/:workspaceId/teams/:teamId/rituals/:ritualId/sessions')
@ApiTags('sessions')
export class RitualSessionsController {
  constructor(private readonly ritualSessionsService: RitualSessionsService) {}

  @Post('start')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceOwnerGuard, TeamGuard)
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
  @UseGuards(JwtAuthGuard, WorkspaceGuard, TeamGuard)
  @AllowTeamGuests()
  listSessions(
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
    @Param('ritualId') ritualId: string,
  ) {
    return this.ritualSessionsService.listSessions(workspaceId, teamId, ritualId);
  }

  @Get(':sessionId')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, TeamGuard)
  @AllowTeamGuests()
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
