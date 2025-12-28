import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { User } from '../../users/entities/user.entity';
import { RitualType } from '../../common/enums/ritual-type.enum';
import { RitualFrequency } from '../../common/enums/ritual-frequency.enum';
import { RitualStatus } from '../../common/enums/ritual-status.enum';
import { RitualSession } from '../../ritual-sessions/entities/ritual-session.entity';

@Entity('rituals')
export class Ritual {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_id', type: 'uuid' })
  teamId: string;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'enum', enum: RitualType })
  type: RitualType;

  @Column({ type: 'enum', enum: RitualFrequency })
  frequency: RitualFrequency;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({ type: 'enum', enum: RitualStatus, default: RitualStatus.ACTIVE })
  status: RitualStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ManyToOne(() => Team, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @OneToMany(() => RitualSession, (session) => session.ritual)
  sessions?: RitualSession[];
}
