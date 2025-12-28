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
import { WorkspaceRoles } from '../workspaces/decorators/workspace-roles.decorator';
import { WorkspaceRole } from '../common/enums/workspace-role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { type RequestUser } from '../common/types';
import { CreateTeamDto } from './dto/create-team.dto';
import { TeamGuard } from './guards/team.guard';
import { AddTeamMemberDto } from './dto/add-team-member.dto';
import { TeamRoles } from './decorators/team-roles.decorator';
import { TeamRole } from '../common/enums/team-role.enum';

@Controller('workspaces/:workspaceId/teams')
@ApiTags('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @WorkspaceRoles(WorkspaceRole.ADMIN)
  @UseGuards(WorkspaceGuard)
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
  @UseGuards(WorkspaceGuard, TeamGuard)
  getTeam(
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
  ) {
    return this.teamsService.getTeam(workspaceId, teamId);
  }

  @Get(':teamId/members')
  @UseGuards(WorkspaceGuard, TeamGuard)
  listMembers(@Param('teamId') teamId: string) {
    return this.teamsService.listMembers(teamId);
  }

  @Post(':teamId/members')
  @TeamRoles(TeamRole.LEAD)
  @UseGuards(WorkspaceGuard, TeamGuard)
  addMember(
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
    @Body() dto: AddTeamMemberDto,
  ) {
    return this.teamsService.addMember(workspaceId, teamId, dto);
  }
}
