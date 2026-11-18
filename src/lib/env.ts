import { z } from "zod";

const value = (input: string | undefined) => input?.trim() ? input : undefined;

const schema = z.object({
  MONGODB_URI: z.string().min(1).optional(),
  MONGODB_DB: z.string().default("zash"),
  OWNER_SESSION_SECRET: z.string().min(32).optional(),
  PUBLIC_BASE_URL: z.string().url().default("http://localhost:3001"),
});

export const env = schema.parse({
  MONGODB_URI: value(process.env.MONGODB_URI),
  MONGODB_DB: value(process.env.MONGODB_DB) ?? "zash",
  OWNER_SESSION_SECRET: value(process.env.OWNER_SESSION_SECRET),
  PUBLIC_BASE_URL: value(process.env.PUBLIC_BASE_URL) ?? "http://localhost:3001",
});
