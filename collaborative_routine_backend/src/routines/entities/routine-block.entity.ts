import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Group } from '../../groups/entities/group.entity';

@Entity('routine_blocks')
@Index(['userId', 'date'])
@Index(['groupId', 'date'])
export class RoutineBlock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'uuid' })
  groupId: string;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD

  @Column({ type: 'time' })
  startTime: string; // "06:00"

  @Column({ type: 'time' })
  endTime: string; // "07:00"

  @Column({ type: 'text' })
  title: string;

  @Column({
    type: 'text',
    default: 'public',
  })
  visibility: 'public' | 'busy' | 'hidden';

  @Column({ type: 'text', nullable: true })
  color?: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  group: Group;
}
