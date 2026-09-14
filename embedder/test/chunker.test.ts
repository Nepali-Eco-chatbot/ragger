import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { join } from "node:path";
import { chunkData } from "../helpers/chunker";
import type { TJSONData } from "../types/base";

const fileName = "chunker-test-fixture.md";
const filePath = join(process.cwd(), `./downloads/${fileName}`);

const fixtureMarkdown = `# Water Sector Resilience in South Asia

South Asia is among the world's most climate-vulnerable regions, with
countries like Bangladesh, India, Nepal, and Pakistan consistently ranking
among the top ten most affected nations in the Global Climate Risk Index.

## Nature-based Solutions

Nature-based Solutions (NbS) are emerging as a promising and holistic
approach to addressing the impacts of climate change on water resources.
`;

const data: TJSONData = {
	title: "Water Sector Resilience in South Asia",
	site: "example.com",
	description: "fixture used to test the chunking step in isolation",
	link: "https://example.com/fixture",
	type: "PDF",
};

describe("Checking chunker", () => {
	beforeAll(async () => {
		await Bun.write(filePath, fixtureMarkdown);
	});

	afterAll(async () => {
		const file = Bun.file(filePath);
		if (await file.exists()) await file.delete();
	});

	test("splits a document into embeddable, contextualized chunks", async () => {
		const chunks = [];
		for await (const chunk of chunkData({ fileName, data })) {
			chunks.push(chunk);
		}

		expect(chunks.length).toBeGreaterThan(0);

		for (const chunk of chunks) {
			expect(chunk.text).toBeString();
			expect(chunk.contextualized).toBeString();
			expect(chunk.contextualized.length).toBeGreaterThan(0);
		}
	});
});