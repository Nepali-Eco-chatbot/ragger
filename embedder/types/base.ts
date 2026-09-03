import type { DataArray } from "@huggingface/transformers";
import type { knw_sources } from "../db/schema";

export type TJSONData = Omit<typeof knw_sources.$inferInsert, "id">;
export type TEmbeddedChunk = { chunk: string; embedding: DataArray };
