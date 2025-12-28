import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../src/users/entities/user.entity';
import { Workspace } from '../src/workspaces/entities/workspace.entity';
import { WorkspaceMember } from '../src/workspaces/entities/workspace-member.entity';
import { Team } from '../src/teams/entities/team.entity';
import { TeamMember } from '../src/teams/entities/team-member.entity';
import { Ritual } from '../src/rituals/entities/ritual.entity';
import { RitualSession } from '../src/ritual-sessions/entities/ritual-session.entity';
import { RitualResponse } from '../src/ritual-responses/entities/ritual-response.entity';
import { SentimentSnapshot } from '../src/sentiment/entities/sentiment-snapshot.entity';

config();

async function resetDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: [
      User,
      Workspace,
      WorkspaceMember,
      Team,
      TeamMember,
      Ritual,
      RitualSession,
      RitualResponse,
      SentimentSnapshot,
    ],
    synchronize: true,
    dropSchema: true,
  });

  try {
    await dataSource.initialize();
    await dataSource.synchronize();
    console.log('Database schema reset complete.');
  } finally {
    await dataSource.destroy();
  }
}

resetDatabase().catch((error) => {
  console.error('Failed to reset database schema:', error);
  process.exit(1);
});
