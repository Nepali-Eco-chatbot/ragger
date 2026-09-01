import { FeatureExtractionPipeline, pipeline } from "@huggingface/transformers";
import type { TEmbeddedChunk } from "../types/base";

export class Embedder {
	extractor: FeatureExtractionPipeline | null = null;
	constructor() { }

	async init() {
		this.extractor = await pipeline("feature-extraction", "intfloat/multilingual-e5-small");
		return this;
	}

	embed = async (chunk: string): Promise<TEmbeddedChunk> => {
		if (this.extractor === null)
			return {
				chunk,
				embedding: [],
			};

		const embedding = await this.extractor(chunk, {
			normalize: true,
			pooling: "mean",
		});

		return {
			chunk,
			embedding: Array.from(embedding.data as Float32Array),
		};
	};
}
