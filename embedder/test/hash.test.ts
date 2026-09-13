import { afterAll, describe, expect, test } from "bun:test";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { knw_sources } from "../db/schema";
import { checkHashStore, getHash } from "../helpers/hash";
import type { TJSONData } from "../types/base";

const inputData = `[
	{"title":"Enhancing Water Sector Resilience through Nature-based Solutions in South Asia","site":"iucn.org","description":"South Asia is among the world's most climate-vulnerable regions, with countries like Bangladesh, India, Nepal, and Pakistan consistently ranking among the top ten most affected nations in the Global Climate Risk Index. Nature-based Solutions (NbS) are emerging as a promising and holistic approach to addressing the impacts of climate change on water resources.\\n\\nA review of climate and water policies in these four countries shows that NbS principles are increasingly being integrated into national frameworks. Based on this context, the report outlines five strategic directions for national governments to prioritise in order to accelerate the mainstreaming and scaling up of NbS, thereby strengthening water resilience for communities and economic sectors.","link":"https://iucn.org/sites/default/files/2025-08/regional-guidance_nbs_water_sector_south-asia.pdf","type":"PDF"}
]`;

describe("Hashing", () => {
	const JSONData: TJSONData[] = JSON.parse(inputData);
	const data = JSONData[0]!;
	const stringData = JSON.stringify(data);
	const hash = getHash(stringData);

	// keep the test idempotent: whatever this file inserts into
	// `knw_sources`, it removes again once the suite is done.
	afterAll(async () => {
		await db.delete(knw_sources).where(eq(knw_sources.id, hash));
	});

	test("creating hash", () => {
		expect(hash).toBeString();
		expect(getHash(stringData)).toBe(hash);
	});

	test("Checking hash before the source exists in the database", async () => {
		const isPresent = await checkHashStore(stringData);
		expect(isPresent).toBeFalse();
	});

	test("Checking hash after the source is stored in the database", async () => {
		await db.insert(knw_sources).values({
			id: hash,
			...data,
		});

		const isPresent = await checkHashStore(stringData);
		expect(isPresent).toBeTrue();
	});
});