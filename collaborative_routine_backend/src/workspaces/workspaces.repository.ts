import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';

@Injectable()
export class WorkspacesRepository {
  constructor(
    @InjectRepository(Workspace)
    private readonly repository: Repository<Workspace>,
  ) {}

  create(payload: Partial<Workspace>) {
    return this.repository.create(payload);
  }

  save(workspace: Workspace) {
    return this.repository.save(workspace);
  }

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  findByIdWithMembers(id: string) {
    return this.repository.findOne({
      where: { id },
      relations: {
        members: {
          user: true,
        },
      },
    });
  }

  listForUser(userId: string) {
    return this.repository
      .createQueryBuilder('workspace')
      .innerJoin('workspace.members', 'membership')
      .where('membership.userId = :userId', { userId })
      .getMany();
  }
}
