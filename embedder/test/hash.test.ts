import { join } from "node:path";
import { expect, test, describe } from "bun:test";
import { checkHashStore, updateHashStore } from "../helpers/hash";
import type { TJSONData } from "../types/base";

const inputData = `[
	{"title":"Enhancing Water Sector Resilience through Nature-based Solutions in South Asia","site":"iucn.org","description":"South Asia is among the world’s most climate-vulnerable regions, with countries like Bangladesh, India, Nepal, and Pakistan consistently ranking among the top ten most affected nations in the Global Climate Risk Index. Nature-based Solutions (NbS) are emerging as a promising and holistic approach to addressing the impacts of climate change on water resources.\\n\\nA review of climate and water policies in these four countries shows that NbS principles are increasingly being integrated into national frameworks. Based on this context, the report outlines five strategic directions for national governments to prioritise in order to accelerate the mainstreaming and scaling up of NbS, thereby strengthening water resilience for communities and economic sectors.","link":"https://iucn.org/sites/default/files/2025-08/regional-guidance_nbs_water_sector_south-asia.pdf","type":"PDF"}
]`;

describe("Hashing", () => {
	try {
		const JSONData: TJSONData[] = JSON.parse(inputData);
		const data = JSONData[0];

		test("creating hash", async () => {
			const hash = await updateHashStore(JSON.stringify(data));
			expect(hash).toBeString();
		});

		test("Checking hash", async () => {
			const isPresent = await checkHashStore(JSON.stringify(data));
			expect(isPresent).toBeTrue();
		});

		test("Checking hash after file removal", async () => {
			const path = join(process.cwd(), "hash-store");
			await Bun.file(path).delete();

			const isPresent = await checkHashStore(JSON.stringify(data));
			expect(isPresent).toBeFalse();
		});
	} catch (e) {
		console.log("Parsing Failed");
	}
});
