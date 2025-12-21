import * as z from "zod";

const ApplicationSchema = z.object({
  appPort: z.number(),
});

export const applicationEnvs = ApplicationSchema.parse({
  appPort: process.env.APPLICATION_PORT ?? 3000,
});
