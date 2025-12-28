import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';
import { Ritual } from '../rituals/entities/ritual.entity';
import { RitualSession } from '../ritual-sessions/entities/ritual-session.entity';
import { SentimentModule } from '../sentiment/sentiment.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ritual, RitualSession]),
    SentimentModule,
    WorkspacesModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardRepository],
})
export class DashboardModule {}
