import type { TEmbeddedChunk, TJSONData } from "../types/base";
import { checkHashStore, updateHashStore } from "./hash";
import { downloadFile } from "./downloader";
import { db } from "../db";
import { knw_sources, pknw_base } from "../db/schema";
import { chunkData } from "./chunker";
import { Embedder } from "./embedder";
import { DEBUG } from "..";
import { sql } from "drizzle-orm";

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
export const dataProcesser = async (data: TJSONData) => {
	const stringData = JSON.stringify(data);
	const isAlreadyEmbeded = await checkHashStore(stringData);
	if (isAlreadyEmbeded) {
		console.log("Hash already present skipping!");
		return;
	}

	if (DEBUG) console.log("updating hash-store");
	const entryHash = await updateHashStore(stringData);
	const fileName = `${entryHash}.${data.type}`;
	if (DEBUG) console.log("✅ hash-store updated");
	if (DEBUG) console.log("downloading file", fileName);
	const file = await downloadFile(data, fileName);
	if (!file && data.type !== "SEARCH_SOURCE") {
		console.error("[Error]: Something went wrong while downloading the file.");
		return;
	}
	if (DEBUG) console.log("✅ file downloaded");
	if (DEBUG) console.log("updating database");
	await db.insert(knw_sources).values({
		id: entryHash,
		...data,
	});
	if (DEBUG) console.log("✅ database updated");

	if (data.type === "SEARCH_SOURCE") {
		return;
	}
	if (DEBUG) console.log("Chunking data");
	const chunkedData = chunkData({ fileName, data });
	let embeddedChunks: Promise<TEmbeddedChunk>[] = [];
	if (DEBUG) console.log("✅ data chunked");

	for await (const chunk of chunkedData) {
		if (embeddedChunks.length < BATCH_SIZE) {
			if (DEBUG) console.log("embedding chunk", chunk.contextualized);
			embeddedChunks.push(embedder.embed(chunk.contextualized));
			continue;
		}

		const results = await Promise.all(embeddedChunks);
		if (DEBUG) console.log("Generating embeddings");
		const values = results.map((result) => {
			return {
				source: entryHash,
				content: result.chunk,
				embedding: Array.from(result.embedding),
			};
		});

		if (DEBUG) console.log("Updating embedding to db");

		// we don't need to batch because we are performing only insert operation.
		await db.insert(pknw_base).values(values);
		embeddedChunks = [];
	}

	if (DEBUG) console.log("✅ embedding generated and inserted to db");
};
