import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Ritual } from '../../rituals/entities/ritual.entity';
import { RitualSessionStatus } from '../../common/enums/session-status.enum';
import { RitualResponse } from '../../ritual-responses/entities/ritual-response.entity';
import { Team } from '../../teams/entities/team.entity';

@Entity('ritual_sessions')
@Index(['ritualId', 'status'])
@Index(['teamId', 'status'])
export class RitualSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'workspace_id', type: 'uuid' })
  workspaceId: string;

  @Column({ name: 'team_id', type: 'uuid' })
  teamId: string;

  @Column({ name: 'ritual_id', type: 'uuid' })
  ritualId: string;

  @Column({ name: 'status', type: 'enum', enum: RitualSessionStatus, default: RitualSessionStatus.OPEN })
  status: RitualSessionStatus;

  @Column({ name: 'scheduled_for', type: 'timestamptz', nullable: true })
  scheduledFor?: Date;

  @Column({ name: 'started_at', type: 'timestamptz' })
  startedAt: Date;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt?: Date;

  @Column({ name: 'response_count', type: 'int', default: 0 })
  responseCount: number;

  @Column({ name: 'expected_responses', type: 'int', default: 0 })
  expectedResponses: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Ritual, (ritual) => ritual.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ritual_id' })
  ritual: Ritual;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @OneToMany(() => RitualResponse, (response) => response.session)
  responses?: RitualResponse[];
}
