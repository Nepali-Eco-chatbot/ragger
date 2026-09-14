import { afterAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { knw_sources, pknw_base } from "../db/schema";

const sourceId = `db-test-${Bun.hash("database connection/operations test").toString()}`;

const source = {
	id: sourceId,
	title: "DB connectivity check",
	description: "A throwaway source row used only to verify db operations.",
	link: "https://example.com/db-test",
	type: "PDF" as const,
	site: "example.com",
};

describe("Checking database connection/operations", () => {
	afterAll(async () => {
		await db.delete(knw_sources).where(eq(knw_sources.id, sourceId));
	});

	test("can connect and insert a knowledge source", async () => {
		await db.insert(knw_sources).values(source);
		const rows = await db.select().from(knw_sources).where(eq(knw_sources.id, sourceId));
		expect(rows).toHaveLength(1);
		expect(rows[0]!.title).toBe(source.title);
	});

	test("can insert an embedded chunk referencing that source", async () => {
		await db.insert(pknw_base).values({
			source: sourceId,
			content: "a chunk of embeddable content",
			embedding: new Array(384).fill(0),
		});
		const rows = await db.select().from(pknw_base).where(eq(pknw_base.source, sourceId));
		expect(rows).toHaveLength(1);
		expect(rows[0]!.content).toBe("a chunk of embeddable content");
		expect(rows[0]!.embedding).toHaveLength(384);
	});

	test("deleting the source cascades to its embedded chunks", async () => {
		await db.delete(knw_sources).where(eq(knw_sources.id, sourceId));
		const remainingChunks = await db.select().from(pknw_base).where(eq(pknw_base.source, sourceId));
		expect(remainingChunks).toHaveLength(0);
	});
});