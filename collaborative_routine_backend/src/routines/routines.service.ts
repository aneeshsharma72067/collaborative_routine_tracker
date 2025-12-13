import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RoutineBlock } from './entities/routine-block.entity';
import { GroupMember } from '../groups/entities/group-member.entity';
import { User } from '../users/entities/user.entity';
import { Group } from '../groups/entities/group.entity';
import { UpdateMyRoutineDto } from './dto/update-my-routine.dto';
import { RoutineBlockResponseDto } from './dto/routine-block.dto';

@Injectable()
export class RoutinesService {
  private readonly templateDate: string;

  private mapBlock(block: RoutineBlock): RoutineBlockResponseDto {
    return {
      id: block.id,
      startTime: block.startTime,
      endTime: block.endTime,
      title: block.title,
      visibility: block.visibility,
      color: block.color ?? undefined,
    };
  }

  constructor(
    @InjectRepository(RoutineBlock)
    private readonly blocks: Repository<RoutineBlock>,
    @InjectRepository(GroupMember)
    private readonly members: Repository<GroupMember>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Group)
    private readonly groups: Repository<Group>,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.templateDate =
      this.configService.get<string>('ROUTINE_TEMPLATE_DATE') ?? '1970-01-01';
  }

  async getMyRoutine(userId: string) {
    const blocks = await this.blocks.find({
      where: { userId, date: this.templateDate },
      order: { startTime: 'ASC' },
    });

    return {
      blocks: blocks.map((b) => this.mapBlock(b)),
    };
  }

  async updateMyRoutine(userId: string, dto: UpdateMyRoutineDto) {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const membership = await this.members.findOne({ where: { userId } });
    if (!membership) {
      throw new BadRequestException('User does not belong to any group');
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(RoutineBlock, { userId });

      if (!dto.blocks || dto.blocks.length === 0) {
        return;
      }

      const entities = dto.blocks.map((block) =>
        manager.create(RoutineBlock, {
          userId,
          groupId: membership.groupId,
          date: this.templateDate,
          startTime: block.startTime,
          endTime: block.endTime,
          title: block.title,
          visibility: block.visibility,
          color: block.color,
        }),
      );

      await manager.save(entities);
    });

    return this.getMyRoutine(userId);
  }

  async getGroupRoutine(userId: string) {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const membership = await this.members.findOne({ where: { userId } });
    if (!membership) {
      return { routines: [] };
    }

    const members = await this.members.find({
      where: { groupId: membership.groupId },
    });
    if (!members.length) {
      return { routines: [] };
    }

    const userIds = members.map((m) => m.userId);
    const users = await this.users.findBy({ id: In(userIds) });
    const userMap = new Map(users.map((u) => [u.id, u]));

    const blocks = await this.blocks.find({
      where: {
        userId: In(userIds),
        groupId: membership.groupId,
        date: this.templateDate,
      },
      order: { startTime: 'ASC' },
    });

    const blocksByUser = new Map<string, RoutineBlockResponseDto[]>();
    for (const block of blocks) {
      const list = blocksByUser.get(block.userId) ?? [];
      list.push(this.mapBlock(block));
      blocksByUser.set(block.userId, list);
    }

    return {
      routines: members.map((member) => ({
        userId: member.userId,
        name: userMap.get(member.userId)?.name ?? null,
        blocks: blocksByUser.get(member.userId) ?? [],
      })),
    };
  }
}
