import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Ritual } from '../../rituals/entities/ritual.entity';
import { RitualSessionStatus } from '../../common/enums/session-status.enum';
import { RitualResponse } from '../../ritual-responses/entities/ritual-response.entity';

@Entity('ritual_sessions')
@Index(['ritualId', 'scheduledFor'], { unique: true })
export class RitualSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ritual_id', type: 'uuid' })
  ritualId: string;

  @Column({ name: 'scheduled_for', type: 'date' })
  scheduledFor: string;

  @Column({ type: 'enum', enum: RitualSessionStatus, default: RitualSessionStatus.OPEN })
  status: RitualSessionStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Ritual, (ritual) => ritual.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ritual_id' })
  ritual: Ritual;

  @OneToMany(() => RitualResponse, (response) => response.session)
  responses?: RitualResponse[];
}
