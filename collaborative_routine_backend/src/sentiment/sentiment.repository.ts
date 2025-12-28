import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { SentimentSnapshot } from './entities/sentiment-snapshot.entity';

@Injectable()
export class SentimentRepository {
  constructor(
    @InjectRepository(SentimentSnapshot)
    private readonly repository: Repository<SentimentSnapshot>,
  ) {}

  create(payload: Partial<SentimentSnapshot>) {
    return this.repository.create(payload);
  }

  save(snapshot: SentimentSnapshot) {
    return this.repository.save(snapshot);
  }

  findByTeamUserWeek(teamId: string, userId: string, weekStart: string) {
    return this.repository.findOne({
      where: {
        teamId,
        userId,
        weekStartDate: weekStart,
      },
    });
  }

  getTeamAverage(teamId: string) {
    return this.repository
      .createQueryBuilder('snapshot')
      .select('AVG(snapshot.score)', 'average')
      .where('snapshot.teamId = :teamId', { teamId })
      .getRawOne<{ average: string | null }>();
  }

  getWorkspaceAverage(workspaceId: string) {
    return this.repository
      .createQueryBuilder('snapshot')
      .innerJoin('snapshot.team', 'team')
      .where('team.workspaceId = :workspaceId', { workspaceId })
      .select('AVG(snapshot.score)', 'average')
      .getRawOne<{ average: string | null }>();
  }

  deleteSnapshotsAfter(weekStart: string): Promise<DeleteResult> {
    return this.repository
      .createQueryBuilder()
      .delete()
      .from(SentimentSnapshot)
      .where('week_start_date > :weekStart', { weekStart })
      .execute();
  }
}
