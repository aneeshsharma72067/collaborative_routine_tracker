import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SentimentService } from './sentiment.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../workspaces/guards/workspace.guard';
import { TeamGuard } from '../teams/guards/team.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { type RequestUser } from '../common/types';
import { SubmitSentimentDto } from './dto/submit-sentiment.dto';

@Controller('workspaces/:workspaceId/teams/:teamId/sentiment')
@ApiTags('sentiment')
@UseGuards(JwtAuthGuard, WorkspaceGuard, TeamGuard)
export class SentimentController {
  constructor(private readonly sentimentService: SentimentService) {}

  @Post()
  submitSnapshot(
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: SubmitSentimentDto,
  ) {
    return this.sentimentService.submitSnapshot(
      workspaceId,
      teamId,
      user.sub,
      dto,
    );
  }

  @Get('average')
  async getTeamAverage(@Param('teamId') teamId: string) {
    const average = await this.sentimentService.getTeamAverage(teamId);
    return { average };
  }
}
