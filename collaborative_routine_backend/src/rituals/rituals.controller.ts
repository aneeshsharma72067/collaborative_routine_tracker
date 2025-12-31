import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RitualsService } from './rituals.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../workspaces/guards/workspace.guard';
import { TeamGuard } from '../teams/guards/team.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { type RequestUser } from '../common/types';
import { CreateRitualDto } from './dto/create-ritual.dto';
import { AllowTeamGuests } from '../teams/decorators/team-access.decorator';
import { UpdateRitualStatusDto } from './dto/update-ritual-status.dto';
import { WorkspaceOwnerGuard } from '../workspaces/guards/workspace-owner.guard';

@Controller('workspaces/:workspaceId/teams/:teamId/rituals')
@ApiTags('rituals')
export class RitualsController {
  constructor(private readonly ritualsService: RitualsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceOwnerGuard, TeamGuard)
  createRitual(
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateRitualDto,
  ) {
    return this.ritualsService.createRitual(workspaceId, teamId, user.sub, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceGuard, TeamGuard)
  @AllowTeamGuests()
  listRituals(
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
  ) {
    return this.ritualsService.listRituals(workspaceId, teamId);
  }

  @Patch(':ritualId/status')
  @UseGuards(JwtAuthGuard, WorkspaceGuard, WorkspaceOwnerGuard, TeamGuard)
  updateStatus(
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
    @Param('ritualId') ritualId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateRitualStatusDto,
  ) {
    return this.ritualsService.updateStatus(
      workspaceId,
      teamId,
      ritualId,
      user.sub,
      dto,
    );
  }
}
