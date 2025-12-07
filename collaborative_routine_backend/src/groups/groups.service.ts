import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { GroupInvite } from './entities/group-invite.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groups: Repository<Group>,

    @InjectRepository(GroupMember)
    private readonly members: Repository<GroupMember>,

    @InjectRepository(GroupInvite)
    private readonly invites: Repository<GroupInvite>,

    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateGroupDto, creatorId: string) {
    if (!creatorId) {
      throw new BadRequestException('Creator is required');
    }

    try {
      const exists = await this.groups.exists({
        where: { name: dto.name },
      });

      if (exists) {
        throw new ConflictException('Group name already exists');
      }

      return await this.dataSource.transaction(async (manager) => {
        const groupRepo = manager.getRepository(Group);
        const memberRepo = manager.getRepository(GroupMember);

        // Create group
        const group = groupRepo.create({
          name: dto.name,
          createdBy: creatorId,
        });

        const savedGroup = await groupRepo.save(group);

        // Add creator as owner
        const owner = memberRepo.create({
          groupId: savedGroup.id,
          userId: creatorId,
          role: 'owner',
        });

        await memberRepo.save(owner);

        return {
          id: savedGroup.id,
          name: savedGroup.name,
          createdBy: savedGroup.createdBy,
          createdAt: savedGroup.createdAt,
        };
      });
    } catch (error: any) {
      if (error?.driverError?.code === '23505') {
        throw new ConflictException('Group name already exists');
      }

      console.error(error);
      throw new InternalServerErrorException('Failed to create group');
    }
  }

  async update(id: string, dto: UpdateGroupDto) {
    if (!id) {
      throw new BadRequestException('Group id is required');
    }

    await this.groups.update({ id }, dto);

    return this.groups.findOne({
      where: { id },
      select: ['id', 'name', 'createdBy', 'createdAt'],
    });
  }

  async findAll() {
    return this.groups.find({
      select: ['id', 'name', 'createdBy', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    if (!id) throw new BadRequestException('Group id is required');

    const group = await this.groups.findOne({
      where: { id },
      relations: ['members', 'invites'],
    });

    if (!group) throw new NotFoundException('Group not found');

    return group;
  }

  async remove(id: string, userId?: string) {
    if (!id) throw new BadRequestException('Group id is required');
    if (!userId)
      throw new BadRequestException('User is required to delete a group');

    const group = await this.groups.findOne({ where: { id } });
    if (!group) throw new NotFoundException('Group not found');

    // Only creator/owner can delete
    if (group.createdBy !== userId) {
      throw new ForbiddenException(
        'Only the group owner can delete this group',
      );
    }

    try {
      await this.groups.delete({ id });
      return { success: true };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Failed to delete group');
    }
  }
}
