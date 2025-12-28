import { Injectable, NotFoundException } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';
import { SentimentService } from '../sentiment/sentiment.service';
import { WorkspacesRepository } from '../workspaces/workspaces.repository';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly sentimentService: SentimentService,
    private readonly workspacesRepository: WorkspacesRepository,
  ) {}

  async getWorkspaceMetrics(workspaceId: string) {
    const workspace = await this.workspacesRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const start = this.todayISO();
    const end = this.shiftDate(start, 7);

    const [activeRituals, upcomingSessions, completedSessions, sentimentAvg] =
      await Promise.all([
        this.dashboardRepository.countActiveRituals(workspaceId),
        this.dashboardRepository.countUpcomingSessions(workspaceId, start, end),
        this.dashboardRepository.countCompletedSessions(workspaceId),
        this.sentimentService.getWorkspaceAverage(workspaceId),
      ]);

    return {
      activeRituals,
      upcomingSessions,
      completedSessions,
      averageSentiment: sentimentAvg,
    };
  }

  private todayISO() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return today.toISOString().slice(0, 10);
  }

  private shiftDate(isoDate: string, days: number) {
    const date = new Date(isoDate);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }
}
