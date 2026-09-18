import { drizzle } from "drizzle-orm/libsql/node";

const env = process.env.NODE_ENV;
const isTestEnv = env == "test";

export const db = drizzle({
	connection: isTestEnv
		? {
			url: "file:local_test.db",
		}
		: {
			url: process.env.DATABASE_URL!,
			authToken: process.env.DATABASE_AUTH_TOKEN,
		},
});
