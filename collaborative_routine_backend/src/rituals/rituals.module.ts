import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ritual } from './entities/ritual.entity';
import { RitualsController } from './rituals.controller';
import { RitualsService } from './rituals.service';
import { RitualsRepository } from './rituals.repository';
import { TeamsModule } from '../teams/teams.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [TypeOrmModule.forFeature([Ritual]), TeamsModule, WorkspacesModule],
  controllers: [RitualsController],
  providers: [RitualsService, RitualsRepository],
  exports: [RitualsService, RitualsRepository],
})
export class RitualsModule {}
