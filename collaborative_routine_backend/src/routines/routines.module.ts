import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoutinesService } from './routines.service';
import { RoutinesController } from './routines.controller';
import { RoutineBlock } from './entities/routine-block.entity';
import { GroupMember } from '../groups/entities/group-member.entity';
import { Group } from '../groups/entities/group.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoutineBlock, GroupMember, Group, User])],
  providers: [RoutinesService],
  controllers: [RoutinesController],
  exports: [RoutinesService],
})
export class RoutinesModule {}
