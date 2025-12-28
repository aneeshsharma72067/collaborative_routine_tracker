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
import { TeamRoles } from '../teams/decorators/team-roles.decorator';
import { TeamRole } from '../common/enums/team-role.enum';
import { UpdateRitualStatusDto } from './dto/update-ritual-status.dto';

@Controller('workspaces/:workspaceId/teams/:teamId/rituals')
@ApiTags('rituals')
@UseGuards(JwtAuthGuard, WorkspaceGuard, TeamGuard)
export class RitualsController {
  constructor(private readonly ritualsService: RitualsService) {}

  @Post()
  @TeamRoles(TeamRole.LEAD)
  createRitual(
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateRitualDto,
  ) {
    return this.ritualsService.createRitual(workspaceId, teamId, user.sub, dto);
  }

  @Get()
  listRituals(
    @Param('workspaceId') workspaceId: string,
    @Param('teamId') teamId: string,
  ) {
    return this.ritualsService.listRituals(workspaceId, teamId);
  }

  @Patch(':ritualId/status')
  @TeamRoles(TeamRole.LEAD)
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
