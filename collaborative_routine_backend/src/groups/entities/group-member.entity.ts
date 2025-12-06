import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Group } from './group.entity';

@Entity('group_members')
@Unique(['userId']) // user can belong to only ONE group
@Unique(['groupId', 'userId'])
export class GroupMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  groupId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text', default: 'member' })
  role: 'owner' | 'member';

  @CreateDateColumn({ type: 'timestamptz' })
  joinedAt: Date;

  // Relations
  @ManyToOne(() => Group, (group) => group.members, {
    onDelete: 'CASCADE',
  })
  group: Group;
}
