import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { type RequestUser } from '../common/types';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { WorkspaceGuard } from './guards/workspace.guard';
import { WorkspaceRoles } from './decorators/workspace-roles.decorator';
import { WorkspaceRole } from '../common/enums/workspace-role.enum';
import { AddWorkspaceMemberDto } from './dto/add-workspace-member.dto';

@Controller('workspaces')
@ApiTags('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  createWorkspace(
    @CurrentUser() user: RequestUser,
    @Body() dto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.createWorkspace(user.sub, dto);
  }

  @Get()
  listWorkspaces(@CurrentUser() user: RequestUser) {
    return this.workspacesService.listForUser(user.sub);
  }

  @Get(':workspaceId')
  @UseGuards(WorkspaceGuard)
  getWorkspace(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.getWorkspace(workspaceId);
  }

  @Get(':workspaceId/members')
  @UseGuards(WorkspaceGuard)
  listMembers(@Param('workspaceId') workspaceId: string) {
    return this.workspacesService.getMembers(workspaceId);
  }

  @Post(':workspaceId/members')
  @WorkspaceRoles(WorkspaceRole.ADMIN)
  @UseGuards(WorkspaceGuard)
  addMember(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: AddWorkspaceMemberDto,
  ) {
    return this.workspacesService.addMember(workspaceId, dto);
  }
}
