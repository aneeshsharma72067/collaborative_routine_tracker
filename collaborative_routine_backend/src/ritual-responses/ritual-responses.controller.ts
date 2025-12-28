import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RitualResponsesService } from './ritual-responses.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../workspaces/guards/workspace.guard';
import { TeamGuard } from '../teams/guards/team.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { type RequestUser } from '../common/types';
import { SubmitRitualResponseDto } from './dto/submit-ritual-response.dto';

@Controller(
  'workspaces/:workspaceId/teams/:teamId/rituals/:ritualId/sessions/:sessionId/responses',
)
@ApiTags('responses')
@UseGuards(JwtAuthGuard, WorkspaceGuard, TeamGuard)
export class RitualResponsesController {
  constructor(private readonly ritualResponsesService: RitualResponsesService) {}

  @Post()
  submitResponse(
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
    @Param('ritualId') ritualId: string,
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: SubmitRitualResponseDto,
  ) {
    return this.ritualResponsesService.submitResponse(
      workspaceId,
      teamId,
      ritualId,
      sessionId,
      user.sub,
      dto,
    );
  }

  @Get()
  listResponses(
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
    @Param('ritualId') ritualId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.ritualResponsesService.listResponses(
      workspaceId,
      teamId,
      ritualId,
      sessionId,
    );
  }
}
