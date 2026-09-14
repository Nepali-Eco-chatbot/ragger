import { defineConfig } from "drizzle-kit";

const isTestEnv = process.env.NODE_ENV === "test";

export default defineConfig({
	out: "./drizzle",
	schema: "./db/schema.ts",
	dialect: "turso",
	tablesFilter: ["!__turso_*"],
	dbCredentials: {
		url: isTestEnv ? "file:local_test.db" : process.env.DATABASE_URL!,
		authToken: process.env.DATABASE_AUTH_TOKEN,
	},
});
