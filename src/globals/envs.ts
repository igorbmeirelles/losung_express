import type { SignOptions } from "jsonwebtoken";
import * as z from "zod";

const ApplicationSchema = z.object({
  appPort: z.coerce.number(),
});

export const applicationEnvs = ApplicationSchema.parse({
  appPort: process.env.APPLICATION_PORT ?? 3000,
});

const DatabaseSchema = z.object({
  databaseUrl: z.string(),
  directUrl: z.string(),
});

DatabaseSchema.parse({
  databaseUrl: process.env.DATABASE_URL,
  directUrl: process.env.DIRECT_URL,
});

const CacheSchema = z.object({
  upstashRedisUrl: z.string().url(),
  upstashRedisToken: z.string(),
});

export const AuthSchema = z.object({
  jwtSecret: z.string(),

  jwtExpiresIn: z.custom<SignOptions["expiresIn"]>().default("1h"),

  refreshExpiresIn: z.custom<SignOptions["expiresIn"]>().default("7d"),
});

export const authEnvs = AuthSchema.parse({
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
});

export const cacheEnvs = CacheSchema.parse({
  upstashRedisUrl: process.env.UPSTASH_REDIS_REST_URL ?? "http://localhost:6379",
  upstashRedisToken: process.env.UPSTASH_REDIS_REST_TOKEN ?? "test-token",
});
