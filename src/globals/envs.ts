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
