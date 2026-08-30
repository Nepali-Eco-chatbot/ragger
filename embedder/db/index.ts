import { drizzle } from "drizzle-orm/libsql/node";
import { pknw_base_idx } from "./schema";

export const db = drizzle({
	connection: {
		url: process.env.DATABASE_URL!,
		authToken: process.env.DATABASE_AUTH_TOKEN,
	},
});

try {
	await db.run(pknw_base_idx);
} catch (e) {
	console.error(e);
}
