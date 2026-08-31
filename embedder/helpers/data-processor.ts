import type { TEmbeddedChunk, TJSONData } from "../types/base";
import { checkHashStore, updateHashStore } from "./hash";
import { downloadFile } from "./downloader";
import { db } from "../db";
import { knw_sources } from "../db/schema";
import { chunkData } from "./chunker";
import { Embedder } from "./embedder";

const embedder = await new Embedder().init();

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

	if (data.type === "SEARCH_SOURCE") {
		return;
	}

	const knwSourceId = await db.insert(knw_sources).values({
		id: entryHash,
		...data,
	});

	const chunkedData = chunkData({ fileName, data });
	const embeddedChunks: Promise<TEmbeddedChunk>[] = [];

	for await (const chunk of chunkedData) {
		embeddedChunks.push(embedder.embed(chunk.contextualized));
	}

	await Promise.all(embeddedChunks);
};
