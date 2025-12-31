import { Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RitualSessionsService } from './ritual-sessions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../workspaces/guards/workspace.guard';
import { TeamGuard } from '../teams/guards/team.guard';
import { WorkspaceOwnerGuard } from '../workspaces/guards/workspace-owner.guard';

@Controller('workspaces/:workspaceId/teams/:teamId')
@ApiTags('sessions')
export class SessionLifecycleController {
  constructor(private readonly ritualSessionsService: RitualSessionsService) {}

  @Patch('sessions/:sessionId/close')
  @UseGuards(
    JwtAuthGuard,
    WorkspaceGuard,
    WorkspaceOwnerGuard,
    TeamGuard,
  )
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
