import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RitualSession } from './entities/ritual-session.entity';
import { RitualSessionsController } from './ritual-sessions.controller';
import { RitualSessionsService } from './ritual-sessions.service';
import { RitualSessionsRepository } from './ritual-sessions.repository';
import { RitualsModule } from '../rituals/rituals.module';
import { TeamsModule } from '../teams/teams.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RitualSession]),
    RitualsModule,
    TeamsModule,
    WorkspacesModule,
  ],
  controllers: [RitualSessionsController],
  providers: [RitualSessionsService, RitualSessionsRepository],
  exports: [RitualSessionsService, RitualSessionsRepository],
})
export class RitualSessionsModule {}
