import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { WorkspaceRole } from '../common/enums/workspace-role.enum';

@Injectable()
export class WorkspaceMembersRepository {
  constructor(
    @InjectRepository(WorkspaceMember)
    private readonly repository: Repository<WorkspaceMember>,
  ) {}

  create(payload: Partial<WorkspaceMember>) {
    return this.repository.create(payload);
  }

  save(member: WorkspaceMember) {
    return this.repository.save(member);
  }

  findMembership(workspaceId: string, userId: string) {
    return this.repository.findOne({
      where: {
        workspaceId,
        userId,
      },
      relations: {
        user: true,
      },
    });
  }

  listMembers(workspaceId: string) {
    return this.repository.find({
      where: { workspaceId },
      relations: {
        user: true,
      },
    });
  }

  async isAdmin(workspaceId: string, userId: string) {
    const membership = await this.findMembership(workspaceId, userId);
    return membership?.role === WorkspaceRole.ADMIN;
  }
}
