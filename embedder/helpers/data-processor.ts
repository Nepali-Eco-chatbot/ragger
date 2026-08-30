import type { TJSONData } from "../types/base";
import { checkHashStore, updateHashStore } from "./hash";
import { downloadFile } from "./downloader";
import { db } from "../db";
import { knw_sources } from "../db/schema";
import { chunkAndInsertPdf } from "./chunk-and-insert-pdf";

export const dataProcesser = async (data: TJSONData, _index: number) => {
	const stringData = JSON.stringify(data);
	const isAlreadyEmbeded = await checkHashStore(stringData);
	if (isAlreadyEmbeded) return;

	const entryHash = await updateHashStore(stringData);
	const fileName = `${entryHash}.${data.type}`;

	const file = await downloadFile(data, fileName);

	switch (true) {
		case (!file && data.type !== "SEARCH_SOURCE") as boolean: {
			console.error("[Error]: Something went wrong while downloading the file.");
			return;
		}

		case data.type === "SEARCH_SOURCE": {
			break;
		}
		case data.type === "PDF": {
			chunkAndInsertPdf({ fileName, data });
		}
	}

	await db.insert(knw_sources).values({
		id: entryHash,
		...data,
	});
};
