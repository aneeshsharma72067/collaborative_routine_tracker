import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from './entities/team-member.entity';

@Injectable()
export class TeamMembersRepository {
  constructor(
    @InjectRepository(TeamMember)
    private readonly repository: Repository<TeamMember>,
  ) {}

  create(payload: Partial<TeamMember>) {
    return this.repository.create(payload);
  }

  save(member: TeamMember) {
    return this.repository.save(member);
  }

  findMembership(teamId: string, userId: string) {
    return this.repository.findOne({
      where: {
        teamId,
        userId,
      },
      relations: {
        user: true,
      },
    });
  }

  listMembers(teamId: string) {
    return this.repository.find({
      where: { teamId },
      relations: {
        user: true,
      },
    });
  }

  countByTeam(teamId: string) {
    return this.repository.count({ where: { teamId } });
  }
}
