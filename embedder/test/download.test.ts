import { join } from "node:path";
import { expect, test, describe } from "bun:test";
import type { TJSONData } from "../types/base";
import { downloadFile } from "../helpers/downloader";

const inputData = `[
	{"title":"Enhancing Water Sector Resilience through Nature-based Solutions in South Asia","site":"iucn.org","description":"South Asia is among the world’s most climate-vulnerable regions, with countries like Bangladesh, India, Nepal, and Pakistan consistently ranking among the top ten most affected nations in the Global Climate Risk Index. Nature-based Solutions (NbS) are emerging as a promising and holistic approach to addressing the impacts of climate change on water resources.\\n\\nA review of climate and water policies in these four countries shows that NbS principles are increasingly being integrated into national frameworks. Based on this context, the report outlines five strategic directions for national governments to prioritise in order to accelerate the mainstreaming and scaling up of NbS, thereby strengthening water resilience for communities and economic sectors.","link":"https://iucn.org/sites/default/files/2025-08/regional-guidance_nbs_water_sector_south-asia.pdf","type":"PDF"},
	{"title":"Scaling-up Mountain Ecosystem-based Adaptation in Nepal","site":"iucn.org","description":"Nepal's mountain ecosystems are highly vulnerable to the impacts of climate change, which threatens local agriculture, water security, and rural livelihoods. Ecosystem-based Adaptation (EbA) measures offer a sustainable pathway to build climate resilience by leveraging natural infrastructure and biodiversity.This information brief evaluates the implementation of EbA initiatives in regions such as the Panchase landscape and Harpan Khola sub-watershed. It details the integration of organic farming, watershed management, and community-led conservation to secure water sources and reduce disaster risks, providing a framework for scaling these solutions nationally.","link":"https://iucn.org/sites/default/files/2025-02/2.-nepal-information-brief_march_30-24_with_donor_logos_resized.pdf","type":"PDF"},
	{"title":"","site":"","description":"Nepal's mountain ecosystems are highly vulnerable to the impacts of climate change, which threatens local agriculture, water security, and rural livelihoods. Ecosystem-based Adaptation (EbA) measures offer a sustainable pathway to build climate resilience by leveraging natural infrastructure and biodiversity.This information brief evaluates the implementation of EbA initiatives in regions such as the Panchase landscape and Harpan Khola sub-watershed. It details the integration of organic farming, watershed management, and community-led conservation to secure water sources and reduce disaster risks, providing a framework for scaling these solutions nationally.","link":"https://iucn.org/sites/default/files/2025-02/2.-nepal-information-brief_march_30-24_with_donor_logos_resized.pdf","type":"SEARCH_SOURCE"}
]`;

describe("Checking downloader", async () => {
	try {
		const JSONData: TJSONData[] = JSON.parse(inputData);

		for (let i = 0; i < JSONData.length; i++) {
			const data = JSONData[i]!;
			const entryHash = Bun.hash(JSON.stringify(data));

			const fileName = `${entryHash}.${data.type}`;
			const filePath = join(process.cwd(), `./downloads/${fileName}`);

			test("Downloading... files of downloadable type", async () => {
				const isDownloaded = await downloadFile(data, fileName);

				if (i == 2) {
					expect(isDownloaded).toBeFalse();
					return;
				}

				expect(isDownloaded).toBeTrue();
			});

			test("Checking File Existence", async () => {
				const file = Bun.file(filePath);
				const existsInFileSystem = await file.exists();

				if (i == 2) return expect(existsInFileSystem).toBeFalse();

				expect(existsInFileSystem).toBeTrue();
				// if (existsInFileSystem) await file.delete();
			});
		}
	} catch (e) {
		console.log("Parsing Failed", e);
	}
});
