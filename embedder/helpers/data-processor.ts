import type { TEmbeddedChunk, TJSONData } from "../types/base";
import { checkHashStore, updateHashStore } from "./hash";
import { downloadFile } from "./downloader";
import { db } from "../db";
import { knw_sources, pknw_base } from "../db/schema";
import { chunkData } from "./chunker";
import { Embedder } from "./embedder";

const embedder = await new Embedder().init();

/**
 * max of chunks to be processed at once.
 *
 * By processed I mean, generating embedding and inserting to the database.
 */
const BATCH_SIZE = 50;

/**
 * Processes the given `TJSONData` in the following order.
 * - checks if already processed.
 * - if yes ends the execution.
 * - if not generates a hash and store it in hash-store.
 * - downloads the file.
 * - generates the embeddable chunks.
 * - batches in a group of `BATCH_SIZE` items.
 * - generates embedding and inserts into the database.
 */
export const dataProcesser = async (data: TJSONData, _index: number) => {
	const stringData = JSON.stringify(data);
	const isAlreadyEmbeded = await checkHashStore(stringData);
	if (isAlreadyEmbeded) return;

	const entryHash = await updateHashStore(stringData);
	const fileName = `${entryHash}.${data.type}`;

	const file = await downloadFile(data, fileName);
	if (!file && data.type !== "SEARCH_SOURCE") {
		console.error("[Error]: Something went wrong while downloading the file.");
		return;
	}

	await db.insert(knw_sources).values({
		id: entryHash,
		...data,
	});

	if (data.type === "SEARCH_SOURCE") {
		return;
	}

	const chunkedData = chunkData({ fileName, data });
	let embeddedChunks: Promise<TEmbeddedChunk>[] = [];

	for await (const chunk of chunkedData) {
		if (embeddedChunks.length < BATCH_SIZE) {
			embeddedChunks.push(embedder.embed(chunk.contextualized));
			continue;
		}

		const results = await Promise.all(embeddedChunks);
		const values = results.map((result) => {
			return {
				source: entryHash,
				content: result.chunk,
				embedding: result.embedding,
			};
		});

		// we don't need to batch because we are performing only insert operation.
		await db.insert(pknw_base).values(values);
		embeddedChunks = [];
	}
};
