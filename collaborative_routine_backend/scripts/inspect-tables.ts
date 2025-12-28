import 'reflect-metadata';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

async function inspect() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  const dataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
    entities: [],
  });

  try {
    await dataSource.initialize();
    const rows = await dataSource.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;",
    );
    console.log('Public tables:', rows.map((row: any) => row.table_name));
  } finally {
    await dataSource.destroy();
  }
}

inspect().catch((error) => {
  console.error('Failed to inspect database:', error);
  process.exit(1);
});
