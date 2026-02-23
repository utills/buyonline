/**
 * Validates required environment variables at application startup.
 * Called before NestJS bootstraps to fail fast on misconfiguration.
 */

export function validateEnv(): void {
  if (!process.env['DATABASE_URL']) {
    throw new Error(
      '[Config] DATABASE_URL is required. Copy .env.example to .env and set your database connection string.',
    );
  }

  if (!process.env['ANTHROPIC_API_KEY']) {
    console.warn('[Config] ANTHROPIC_API_KEY is not set — AI chat features will be unavailable.');
  }

  if (!process.env['REDIS_URL']) {
    console.warn('[Config] REDIS_URL is not set — chat session history will not persist across restarts.');
  }
}
