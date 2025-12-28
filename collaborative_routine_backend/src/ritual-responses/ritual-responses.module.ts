import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RitualResponse } from './entities/ritual-response.entity';
import { RitualResponsesController } from './ritual-responses.controller';
import { RitualResponsesService } from './ritual-responses.service';
import { RitualResponsesRepository } from './ritual-responses.repository';
import { RitualSessionsModule } from '../ritual-sessions/ritual-sessions.module';
import { TeamsModule } from '../teams/teams.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RitualResponse]),
    RitualSessionsModule,
    TeamsModule,
    WorkspacesModule,
  ],
  controllers: [RitualResponsesController],
  providers: [RitualResponsesService, RitualResponsesRepository],
  exports: [RitualResponsesService, RitualResponsesRepository],
})
export class RitualResponsesModule {}
