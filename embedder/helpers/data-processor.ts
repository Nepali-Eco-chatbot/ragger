import type { TEmbeddedChunk, TJSONData } from "../types/base";
import { checkHashStore, updateHashStore } from "./hash";
import { downloadFile } from "./downloader";
import { db } from "../db";
import { knw_sources } from "../db/schema";
import { chunkData } from "./chunker";
import { Embedder } from "./embedder";

const embedder = await new Embedder().init();

/**
 * max of chunks to be processed at once.
 *
 * By processed I mean, generating embedding and inserting to the database.
 */
const BATCH_SIZE = 50;

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

	const knwSourceId = await db.insert(knw_sources).values({
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
		// TODO: batch update the database.

		embeddedChunks = [];
	}
};
