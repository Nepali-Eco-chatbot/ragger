import { join } from "node:path";
import type { TJSONData } from "../types/base";

export const downloadFile = async (jsonData: TJSONData, name: string): Promise<Boolean> => {
	if (jsonData.type === "SEARCH_SOURCE") return false;

	try {
		const file = await (
			await fetch(jsonData.link, {
				method: "GET",
			})
		).blob();

		const path = join(process.cwd(), `./downloads/${name}`);
		try {
			await Bun.write(path, file);
			return true;
		} catch (e) {
			console.log("Something went wrong while writing the file");
			return false;
		}
	} catch (e) {
		console.log("Something went wrong while Downloading the file");
		return false;
	}
};
