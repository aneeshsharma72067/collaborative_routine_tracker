import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity';
import { TeamMember } from './entities/team-member.entity';
import { TeamsController } from './teams.controller';
import { TeamsService } from './teams.service';
import { TeamsRepository } from './teams.repository';
import { TeamMembersRepository } from './team-members.repository';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { TeamGuard } from './guards/team.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamMember]), WorkspacesModule],
  controllers: [TeamsController],
  providers: [
    TeamsService,
    TeamsRepository,
    TeamMembersRepository,
    TeamGuard,
  ],
  exports: [TeamsRepository, TeamMembersRepository, TeamGuard],
})
export class TeamsModule {}
