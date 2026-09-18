import { eq, sql } from "drizzle-orm";
import { db } from "../db";
import { knw_sources } from "../db/schema";

// calculates the hash without updating the hash-store
export const getHash = (jsonString: string): string => {
	return Bun.hash(jsonString).toString();
};

export const checkHashStore = async (jsonString: string): Promise<boolean> => {
	const hash = getHash(jsonString);

	const [existing] = await db
		.select({ id: knw_sources.id })
		.from(knw_sources)
		.where(eq(knw_sources.id, hash))
		.limit(1);

	return Boolean(existing);
};

