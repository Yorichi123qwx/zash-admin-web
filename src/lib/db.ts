import { Db, MongoClient } from "mongodb";
import { env } from "@/lib/env";

type MongoGlobal = typeof globalThis & { __zashAdminMongoClient?: MongoClient; __zashAdminDb?: Db };
const mongoGlobal = globalThis as MongoGlobal;

export function getDb(): Db {
  if (!env.MONGODB_URI) throw new Error("MONGODB_URI is not configured");
  if (!mongoGlobal.__zashAdminMongoClient) {
    mongoGlobal.__zashAdminMongoClient = new MongoClient(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5_000,
      maxPoolSize: 10,
    });
  }
  if (!mongoGlobal.__zashAdminDb) {
    mongoGlobal.__zashAdminDb = mongoGlobal.__zashAdminMongoClient.db(env.MONGODB_DB);
  }
  return mongoGlobal.__zashAdminDb;
}
