import { dataProcesser } from "./helpers/data-processor";
import type { TJSONData } from "./types/base";
const args = Bun.argv.slice(2);

if (args.length === 0) {
	console.error("No args provided `jsonData` required.");
	process.exit(1);
}

const mayBeJsonData = args[0];
if (!mayBeJsonData) {
	console.error("undefined arg provided");
	process.exit(1);
}

try {
	const jsonData: TJSONData[] = JSON.parse(mayBeJsonData);
	const promisses = jsonData.map(async (data, index) => await dataProcesser(data, index));

	Promise.all(promisses);
} catch (e) {
	console.error("Invalid json data provided");
	process.exit(1);
}
