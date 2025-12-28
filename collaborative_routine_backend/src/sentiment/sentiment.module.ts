import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentimentSnapshot } from './entities/sentiment-snapshot.entity';
import { SentimentController } from './sentiment.controller';
import { SentimentService } from './sentiment.service';
import { SentimentRepository } from './sentiment.repository';
import { TeamsModule } from '../teams/teams.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [TypeOrmModule.forFeature([SentimentSnapshot]), TeamsModule, WorkspacesModule],
  controllers: [SentimentController],
  providers: [SentimentService, SentimentRepository],
  exports: [SentimentService, SentimentRepository],
})
export class SentimentModule {}
