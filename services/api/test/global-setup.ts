import { execSync } from 'node:child_process';
import { testDatabaseUrl } from './db-url';

/** Sincroniza el schema con el Postgres de test antes de correr los e2e. */
export default async function setup(): Promise<void> {
  const url = testDatabaseUrl();
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: url },
  });
}
