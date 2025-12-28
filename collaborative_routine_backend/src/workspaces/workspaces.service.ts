import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { WorkspacesRepository } from './workspaces.repository';
import { WorkspaceMembersRepository } from './workspace-members.repository';
import { UsersRepository } from '../users/users.repository';
import { WorkspaceRole } from '../common/enums/workspace-role.enum';
import { Workspace } from './entities/workspace.entity';
import { AddWorkspaceMemberDto } from './dto/add-workspace-member.dto';
import { WorkspaceMember } from './entities/workspace-member.entity';

@Injectable()
export class WorkspacesService {
  constructor(
    private readonly workspacesRepository: WorkspacesRepository,
    private readonly workspaceMembersRepository: WorkspaceMembersRepository,
    private readonly usersRepository: UsersRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createWorkspace(ownerId: string, dto: CreateWorkspaceDto) {
    const owner = await this.usersRepository.findById(ownerId);
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    let workspace: Workspace | null = null;

    await this.dataSource.transaction(async (manager) => {
      const workspaceRepo = manager.getRepository(Workspace);
      const memberRepo = manager.getRepository(WorkspaceMember);

      workspace = workspaceRepo.create({
        name: dto.name,
        ownerId: ownerId,
      });

      await workspaceRepo.save(workspace!);

      const membership = memberRepo.create({
        workspaceId: workspace!.id,
        userId: ownerId,
        role: WorkspaceRole.ADMIN,
      });

      await memberRepo.save(membership);
    });

    return this.workspacesRepository.findByIdWithMembers(workspace!.id);
  }

  listForUser(userId: string) {
    return this.workspacesRepository.listForUser(userId);
  }

  async addMember(workspaceId: string, dto: AddWorkspaceMemberDto) {
    const user = await this.usersRepository.findById(dto.userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingMembership =
      await this.workspaceMembersRepository.findMembership(
        workspaceId,
        dto.userId,
      );

    if (existingMembership) {
      throw new ConflictException('Member already added to workspace');
    }

    const membership = this.workspaceMembersRepository.create({
      workspaceId,
      userId: dto.userId,
      role: dto.role,
    });

    await this.workspaceMembersRepository.save(membership);

    return this.workspaceMembersRepository.findMembership(
      workspaceId,
      dto.userId,
    );
  }

  getMembers(workspaceId: string) {
    return this.workspaceMembersRepository.listMembers(workspaceId);
  }

  async getWorkspace(workspaceId: string) {
    const workspace = await this.workspacesRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace;
  }
}
