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

if (!process.env.DATABASE_URL || !process.env.DATABASE_AUTH_TOKEN) {
	throw new Error("Invalid env setup");
}

try {
	const jsonData: TJSONData[] = JSON.parse(mayBeJsonData);

	for (let data of jsonData) {
		await dataProcesser(data);
	}
} catch (e) {
	console.log(e);
	console.error("Invalid json data provided");
	process.exit(1);
}
