import { join } from "node:path";
import { expect, test, describe } from "bun:test";
import { checkHashStore, updateHashStore } from "../helpers/hash";

const inputData = `[
	{"title":"Enhancing Water Sector Resilience through Nature-based Solutions in South Asia","site":"iucn.org","description":"South Asia is among the world’s most climate-vulnerable regions, with countries like Bangladesh, India, Nepal, and Pakistan consistently ranking among the top ten most affected nations in the Global Climate Risk Index. Nature-based Solutions (NbS) are emerging as a promising and holistic approach to addressing the impacts of climate change on water resources.\\n\\nA review of climate and water policies in these four countries shows that NbS principles are increasingly being integrated into national frameworks. Based on this context, the report outlines five strategic directions for national governments to prioritise in order to accelerate the mainstreaming and scaling up of NbS, thereby strengthening water resilience for communities and economic sectors.","link":"https://iucn.org/sites/default/files/2025-08/regional-guidance_nbs_water_sector_south-asia.pdf","type":"PDF"},
	{"title":"Scaling-up Mountain Ecosystem-based Adaptation in Nepal","site":"iucn.org","description":"Nepal's mountain ecosystems are highly vulnerable to the impacts of climate change, which threatens local agriculture, water security, and rural livelihoods. Ecosystem-based Adaptation (EbA) measures offer a sustainable pathway to build climate resilience by leveraging natural infrastructure and biodiversity.This information brief evaluates the implementation of EbA initiatives in regions such as the Panchase landscape and Harpan Khola sub-watershed. It details the integration of organic farming, watershed management, and community-led conservation to secure water sources and reduce disaster risks, providing a framework for scaling these solutions nationally.","link":"https://iucn.org/sites/default/files/2025-02/2.-nepal-information-brief_march_30-24_with_donor_logos_resized.pdf","type":"PDF"},
	{"title":"IUCN Red List Spatial Data Download","site":"nrl.iucnredlist.org","description":"Downloadable IUCN species distribution data containing taxonomy, geographic distribution and Red List category information. Can be used to identify species whose ranges include Nepal.","link":"https://nrl.iucnredlist.org/resources/spatial-data-download?utm_source=chatgpt.com","type":"PDF"} ,
	{"title":"Nepal Biodiversity Resource Book","site":"https://www.icimod.org/","description":"Comprehensive resource on Nepal's biodiversity covering flora, fauna, protected areas, Ramsar sites, World Heritage Sites, threatened and protected species, endemic species, habitats, and conservation issues. This should be one of the main sources for the Eco Chatbot.","link":"https://lib.icimod.org/records/tfghx-snx09","type":"PDF"} ,
	{"title":"The Rattans of Nepal: Botanical Descriptions","site":"iucn.org","description":"Rattans (Calamus spp.) are highly valuable non-timber forest products (NTFPs) distributed across the tropical and subtropical forests of Nepal, particularly in the eastern and central regions. They play a significant role in rural livelihoods while contributing to forest understory biodiversity.This specialized botanical assessment provides detailed taxonomic descriptions, ecological preferences, and current conservation statuses for native rattan species. It addresses the threats of over-harvesting and habitat conversion, offering vital baseline data for implementing sustainable forest harvesting practices and community forestry management.","link":"https://portals.iucn.org/library/sites/library/files/documents/1997-056.pdf","type":"PDF"}
]`;

describe("Hashing", () => {
	try {
		const JSONData: {}[] = JSON.parse(inputData);
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
