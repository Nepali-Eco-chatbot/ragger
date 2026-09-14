import { describe, expect, test } from "bun:test";
import { Embedder } from "../helpers/embedder";

const TIMEOUT_MS = 120_000;

describe("Checking embedder", () => {
	test(
		"generates a normalized embedding vector for a chunk of text",
		async () => {
			const embedder = await new Embedder().init();
			const chunk = "Nepal's mountain ecosystems are highly vulnerable to climate change.";

			const result = await embedder.embed(chunk);

			expect(result.chunk).toBe(chunk);
			expect(result.embedding.length).toBe(384);

			const magnitude = Math.sqrt(
				Array.from(result.embedding).reduce((sum, value) => sum + value * value, 0),
			);
			expect(magnitude).toBeCloseTo(1, 1);
		},
		TIMEOUT_MS,
	);

	test(
		"produces different embeddings for unrelated chunks",
		async () => {
			const embedder = await new Embedder().init();
			const a = await embedder.embed("Glacial melt threatens Himalayan water supplies.");
			const b = await embedder.embed("The bakery down the street sells fresh croissants.");
			expect(Array.from(a.embedding)).not.toEqual(Array.from(b.embedding));
		},
		TIMEOUT_MS,
	);
});