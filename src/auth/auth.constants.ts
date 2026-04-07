export const JWT_SECRET =
  process.env.JWT_SECRET ?? 'dev-jwt-secret-change-in-production';

/** Seconds until JWT expiry (default 8h). */
export const JWT_EXPIRES_SECONDS = Number(
  process.env.JWT_EXPIRES_SECONDS ?? 60 * 60 * 8,
);
