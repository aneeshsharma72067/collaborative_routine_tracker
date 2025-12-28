import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { WorkspacesRepository } from './workspaces.repository';
import { WorkspaceMembersRepository } from './workspace-members.repository';
import { UsersModule } from '../users/users.module';
import { WorkspaceGuard } from './guards/workspace.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, WorkspaceMember]), UsersModule],
  controllers: [WorkspacesController],
  providers: [
    WorkspacesService,
    WorkspacesRepository,
    WorkspaceMembersRepository,
    WorkspaceGuard,
  ],
  exports: [
    WorkspacesService,
    WorkspacesRepository,
    WorkspaceMembersRepository,
    WorkspaceGuard,
  ],
})
export class WorkspacesModule {}
