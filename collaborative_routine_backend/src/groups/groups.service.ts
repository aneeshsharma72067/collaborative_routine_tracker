import {
  Injectable,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { GroupInvite } from './entities/group-invite.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private readonly groups: Repository<Group>,

    @InjectRepository(GroupMember)
    private readonly members: Repository<GroupMember>,

    @InjectRepository(GroupInvite)
    private readonly invites: Repository<GroupInvite>,

    @InjectRepository(User)
    private readonly users: Repository<User>,

    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  private generateInviteCode(length = 8): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      const index = Math.floor(Math.random() * chars.length);
      code += chars[index];
    }
    return code;
  }

  private getInviteExpiryDate(): Date | null {
    const ttlMinutes =
      this.configService.get<number>('GROUP_INVITE_TTL_MINUTES') ?? 60;
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);
    return expiresAt;
  }

  private async getGroupMembersInternal(groupId: string) {
    const members = await this.members.find({ where: { groupId } });
    if (!members.length) return [];

    const userIds = members.map((m) => m.userId);
    const users = await this.users.findBy({ id: In(userIds) });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return members.map((member) => ({
      id: member.userId,
      name: userMap.get(member.userId)?.name ?? null,
      role: member.role,
    }));
  }

  async createGroup(dto: CreateGroupDto, creatorId: string) {
    const created = await this.create(dto, creatorId);
    const myGroup = await this.getMyGroup(creatorId);
    if (!myGroup) {
      return {
        id: created.id,
        name: created.name,
        createdBy: created.createdBy,
        members: [],
      };
    }
    return myGroup;
  }

  async getMyGroup(userId: string) {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const membership = await this.members.findOne({ where: { userId } });
    if (!membership) {
      return null;
    }

    const group = await this.groups.findOne({ where: { id: membership.groupId } });
    if (!group) {
      return null;
    }

    const members = await this.getGroupMembersInternal(group.id);

    return {
      id: group.id,
      name: group.name,
      members,
    };
  }

  async createInvite(userId: string) {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const membership = await this.members.findOne({ where: { userId } });
    if (!membership) {
      throw new ForbiddenException('User does not belong to any group');
    }

    if (membership.role !== 'owner') {
      throw new ForbiddenException('Only the group owner can create invites');
    }

    const group = await this.groups.findOne({ where: { id: membership.groupId } });
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const code = this.generateInviteCode();
    const expiresAt = this.getInviteExpiryDate();

    try {
      const invite = this.invites.create({
        groupId: group.id,
        code,
        expiresAt,
        createdBy: userId,
      });

      const saved = await this.invites.save(invite);

      return {
        code: saved.code,
        expiresAt: saved.expiresAt,
      };
    } catch (error: any) {
      if (error?.driverError?.code === '23505') {
        throw new ConflictException('Invite code already exists, try again');
      }
      throw new InternalServerErrorException('Failed to create invite');
    }
  }

  async joinGroup(userId: string, code: string) {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    if (!code) {
      throw new BadRequestException('Invite code is required');
    }

    const invite = await this.invites.findOne({ where: { code } });
    if (!invite) {
      throw new NotFoundException('Invalid invite code');
    }

    if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Invite code has expired');
    }

    const existingMembership = await this.members.findOne({ where: { userId } });
    if (existingMembership) {
      if (existingMembership.groupId === invite.groupId) {
        return { groupId: invite.groupId, userId };
      }
      throw new ForbiddenException('User already belongs to another group');
    }

    try {
      const member = this.members.create({
        groupId: invite.groupId,
        userId,
        role: 'member',
      });

      await this.members.save(member);

      return {
        groupId: invite.groupId,
        userId,
      };
    } catch (error: any) {
      if (error?.driverError?.code === '23505') {
        throw new ConflictException('User already belongs to a group');
      }
      throw new InternalServerErrorException('Failed to join group');
    }
  }

  async getMembers(userId: string) {
    if (!userId) {
      throw new BadRequestException('User id is required');
    }

    const membership = await this.members.findOne({ where: { userId } });
    if (!membership) {
      return [];
    }

    return this.getGroupMembersInternal(membership.groupId);
  }

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
      // pseudo-code in GroupsService
      const existingMembership = await this.members.findOne({
        where: { userId: creatorId },
      });
      if (existingMembership) {
        throw new BadRequestException('User already belongs to a group');
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
      Logger.error(error)
      throw new InternalServerErrorException(error.message || 'Failed to create group');
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
