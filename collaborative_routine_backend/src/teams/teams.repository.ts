import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './entities/team.entity';

@Injectable()
export class TeamsRepository {
  constructor(
    @InjectRepository(Team)
    private readonly repository: Repository<Team>,
  ) {}

  create(payload: Partial<Team>) {
    return this.repository.create(payload);
  }

  save(team: Team) {
    return this.repository.save(team);
  }

  findById(id: string) {
    return this.repository.findOne({ where: { id } });
  }

  listByWorkspace(workspaceId: string) {
    return this.repository.find({ where: { workspaceId } });
  }
}
