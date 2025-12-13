import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.string().optional(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('1h'),
  JWT_REFRESH_SECRET: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  DATABASE_URL: z.string().url(),
});

export function validateEnv(env: NodeJS.ProcessEnv) {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const formatted = result.error.format();
    throw new Error(`Env validation failed: ${JSON.stringify(formatted)}`);
  }
  return result.data;
}
