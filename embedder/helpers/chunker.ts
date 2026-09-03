import type { TJSONData } from "../types/base";
import { streamFileChunks, type Chunk } from "docling.rs";
import { join } from "node:path";

const tokenizerPath = join(process.cwd(), "./downloads/tokenizer.json");

/**
 * Return the chunk stream from the provided doc
 */
export const chunkData = ({
	fileName,
}: {
	fileName: string;
	data: TJSONData;
}): AsyncGenerator<Chunk, void, unknown> => {
	const filePath = join(process.cwd(), `./downloads/${fileName}`);

	console.log({
		filePath,
		tokenizerPath,
	});

	return streamFileChunks(filePath, {
		chunker: "hybrid",
		tokenizer: tokenizerPath,
		maxTokens: 256,
	});
};
