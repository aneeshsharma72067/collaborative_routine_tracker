import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../workspaces/guards/workspace.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { type RequestUser } from '../common/types';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamGuard } from './guards/team.guard';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { AllowTeamGuests } from './decorators/team-access.decorator';
import { WorkspaceOwnerGuard } from '../workspaces/guards/workspace-owner.guard';

@Controller('workspaces/:workspaceId/teams')
@ApiTags('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @UseGuards(WorkspaceGuard, WorkspaceOwnerGuard)
  createTeam(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateTeamDto,
  ) {
    return this.teamsService.createTeam(workspaceId, user.sub, dto);
  }

  @Get()
  @UseGuards(WorkspaceGuard)
  listTeams(@Param('workspaceId') workspaceId: string) {
    return this.teamsService.listTeams(workspaceId);
  }

  @Get(':teamId')
  @AllowTeamGuests()
  @UseGuards(WorkspaceGuard, TeamGuard)
  getTeam(
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
  ) {
    return this.teamsService.getTeam(workspaceId, teamId);
  }

  @Get(':teamId/members')
  @AllowTeamGuests()
  @UseGuards(WorkspaceGuard, TeamGuard)
  listMembers(@Param('teamId') teamId: string) {
    return this.teamsService.listMembers(teamId);
  }

  @Post(':teamId/members')
  @UseGuards(WorkspaceGuard, WorkspaceOwnerGuard, TeamGuard)
  addMember(
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
    @Body() dto: AddTeamMemberDto,
  ) {
    return this.teamsService.addMember(workspaceId, teamId, dto);
  }
}
