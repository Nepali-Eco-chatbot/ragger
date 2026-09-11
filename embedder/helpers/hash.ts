import { sql } from "drizzle-orm";
import { db } from "../db";
import { knw_sources } from "../db/schema";
import { DEBUG } from "../index";

// calculates the hash without updating the hash-store
export const getHash = (jsonString: string): string => {
  return Bun.hash(jsonString).toString();
};
export const checkHashStore = async (jsonString: string): Promise<boolean> => {
  const hash = getHash(jsonString);

  const existingSource = await db
    .select()
    .from(knw_sources)
    .where(sql`${knw_sources.id} = ${hash}`);

  if (DEBUG) {
    console.log("hash exists in database", {
      hash,
      exists: existingSource.length > 0,
    });
  }

  return existingSource.length > 0;
};