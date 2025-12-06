import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { GroupMember } from './entities/group-member.entity';
import { GroupInvite } from './entities/group-invite.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group) private readonly groups: Repository<Group>,
    @InjectRepository(GroupMember)
    private readonly members: Repository<GroupMember>,
    @InjectRepository(GroupInvite)
    private readonly invites: Repository<GroupInvite>,
  ) {}

  create(dto: CreateGroupDto) {
    const group = this.groups.create({ name: dto.name });
    return this.groups.save(group);
  }

  update(id: string, dto: UpdateGroupDto) {
    return this.groups.update({ id }, dto as any);
  }
}
